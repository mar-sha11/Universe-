const mongoose = require('mongoose');

const tribeSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Tribe name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Tribe name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Tribe Type
  tribeType: {
    type: String,
    required: true,
    enum: ['interest', 'location', 'academic', 'mixed'],
    default: 'interest'
  },
  
  // Category for Interest-Based Tribes
  category: {
    type: String,
    enum: [
      'technology',
      'arts',
      'sports',
      'music',
      'business',
      'science',
      'social',
      'gaming',
      'food',
      'travel',
      'other'
    ]
  },
  
  // Location for Location-Based Tribes
  location: {
    university: String,
    campus: String,
    city: String,
    state: String
  },
  
  // Visual Identity
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/universe/image/upload/v1/defaults/tribe-avatar.png'
  },
  coverImage: {
    type: String,
    default: 'https://res.cloudinary.com/universe/image/upload/v1/defaults/tribe-cover.png'
  },
  color: {
    type: String,
    default: '#8B5CF6' // Purple default
  },
  
  // Founder & Admins
  founder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    }
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  
  // Privacy Settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  
  // Join Requests (for private tribes)
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Rules & Guidelines
  rules: [{
    title: String,
    description: String
  }],
  
  // Activity & Engagement
  postCount: {
    type: Number,
    default: 0
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Tags for Discovery
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Verification (for official university tribes)
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
tribeSchema.index({ name: 1 });
tribeSchema.index({ tribeType: 1, category: 1 });
tribeSchema.index({ 'location.university': 1 });
tribeSchema.index({ tags: 1 });
tribeSchema.index({ isActive: 1, isFeatured: -1 });
tribeSchema.index({ memberCount: -1 });

// Method to add member
tribeSchema.methods.addMember = async function(userId, role = 'member') {
  // Check if user is already a member
  const isMember = this.members.some(m => m.user.toString() === userId.toString());
  if (isMember) {
    throw new Error('User is already a member of this tribe');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
  this.memberCount = this.members.length;
  this.lastActivityAt = new Date();
  
  return this.save();
};

// Method to remove member
tribeSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  this.memberCount = this.members.length;
  
  return this.save();
};

// Method to check if user is admin
tribeSchema.methods.isAdmin = function(userId) {
  return this.founder.toString() === userId.toString() || 
         this.admins.some(adminId => adminId.toString() === userId.toString());
};

// Method to check if user is member
tribeSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

// Method to update activity timestamp
tribeSchema.methods.updateActivity = async function() {
  this.lastActivityAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Tribe', tribeSchema);
