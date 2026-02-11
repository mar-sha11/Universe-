const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  attachments: [{
    type: String // Cloudinary URLs
  }],
  // For guest users in Summon Protocol
  isFromGuest: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Flagged for scam keywords
  isFlagged: {
    type: Boolean,
    default: false
  },
  flaggedKeywords: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  // Conversation Type
  type: {
    type: String,
    enum: ['direct', 'group', 'job_related'],
    default: 'direct'
  },
  
  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // For Summon Protocol: Track when guest joined
    joinedAt: {
      type: Date,
      default: Date.now
    },
    // For Summon Protocol: Guest status
    isGuest: {
      type: Boolean,
      default: false
    },
    // For Summon Protocol: Can only see messages from joinedAt onwards
    canViewHistoryBefore: {
      type: Date
    },
    // When user left (for dismissed guests)
    leftAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Related Job (if job_related)
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  
  // Group Conversation Details
  groupName: {
    type: String,
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  groupAvatar: {
    type: String
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Messages
  messages: [messageSchema],
  
  // Last Message Info (for list view)
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date
  },
  
  // Activity
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ relatedJob: 1 });
conversationSchema.index({ lastActivityAt: -1 });
conversationSchema.index({ 'messages.createdAt': -1 });

// Method to add message with scam detection
conversationSchema.methods.addMessage = async function(senderId, content, attachments = []) {
  // Scam keyword detection
  const scamKeywords = [
    'whatsapp',
    'pay me outside',
    'send money to',
    'western union',
    'moneygram',
    'gift card',
    'bitcoin',
    'crypto wallet'
  ];
  
  const lowerContent = content.toLowerCase();
  const foundKeywords = scamKeywords.filter(keyword => lowerContent.includes(keyword));
  const isFlagged = foundKeywords.length > 0;
  
  // Check if sender is a guest and get their join time
  const participant = this.participants.find(p => p.user.toString() === senderId.toString());
  const isFromGuest = participant ? participant.isGuest : false;
  
  const newMessage = {
    sender: senderId,
    content: content,
    attachments: attachments,
    isFromGuest: isFromGuest,
    isFlagged: isFlagged,
    flaggedKeywords: foundKeywords,
    createdAt: new Date()
  };
  
  this.messages.push(newMessage);
  
  // Update last message info
  this.lastMessage = {
    content: content.substring(0, 100), // Truncate for preview
    sender: senderId,
    sentAt: new Date()
  };
  this.lastActivityAt = new Date();
  
  return this.save();
};

// Method to add guest user (Summon Protocol)
conversationSchema.methods.summonGuest = async function(guestUserId, summonedBy) {
  // Check if guest is already in conversation
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === guestUserId.toString()
  );
  
  if (existingParticipant) {
    if (existingParticipant.isActive) {
      throw new Error('User is already in this conversation');
    } else {
      // Reactivate if previously left
      existingParticipant.isActive = true;
      existingParticipant.joinedAt = new Date();
      existingParticipant.leftAt = null;
    }
  } else {
    // Add as new guest participant
    const joinTime = new Date();
    this.participants.push({
      user: guestUserId,
      joinedAt: joinTime,
      isGuest: true,
      canViewHistoryBefore: joinTime, // Can only see messages from now onwards
      isActive: true
    });
    
    // Add system message about guest joining
    this.messages.push({
      sender: summonedBy,
      content: `@User has been summoned to the conversation`,
      isFromGuest: false,
      createdAt: new Date()
    });
  }
  
  this.lastActivityAt = new Date();
  return this.save();
};

// Method to remove guest user (Dismiss from Summon)
conversationSchema.methods.dismissGuest = async function(guestUserId) {
  const participant = this.participants.find(p => 
    p.user.toString() === guestUserId.toString() && p.isGuest
  );
  
  if (!participant) {
    throw new Error('Guest not found in conversation');
  }
  
  participant.isActive = false;
  participant.leftAt = new Date();
  
  this.lastActivityAt = new Date();
  return this.save();
};

// Method to get messages visible to a specific user (respects Summon Protocol)
conversationSchema.methods.getMessagesForUser = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (!participant) {
    throw new Error('User is not part of this conversation');
  }
  
  // If user is a guest, only show messages from their join time
  if (participant.isGuest && participant.canViewHistoryBefore) {
    return this.messages.filter(msg => 
      new Date(msg.createdAt) >= new Date(participant.canViewHistoryBefore)
    );
  }
  
  // Regular users see all messages
  return this.messages;
};

// Method to mark messages as read
conversationSchema.methods.markAsRead = async function(userId) {
  const unreadMessages = this.messages.filter(msg => 
    !msg.readBy.some(r => r.user.toString() === userId.toString())
  );
  
  unreadMessages.forEach(msg => {
    msg.readBy.push({
      user: userId,
      readAt: new Date()
    });
  });
  
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
