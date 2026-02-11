const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Job Basic Information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'coding',
      'design',
      'writing',
      'tutoring',
      'cleaning',
      'repairs',
      'delivery',
      'event_help',
      'other'
    ]
  },
  jobType: {
    type: String,
    required: true,
    enum: ['digital', 'physical'],
    default: 'digital'
  },
  
  // Parties Involved
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Budget & Payment
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget must be positive']
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD']
  },
  
  // Escrow State Machine
  escrowStatus: {
    type: String,
    enum: [
      'open',              // Job posted, looking for freelancer
      'assigned',          // Freelancer accepted job
      'deposit_pending',   // Waiting for client to deposit funds
      'in_progress',       // Funds locked, work in progress
      'review',            // Work submitted, awaiting approval
      'completed',         // Approved, funds released
      'disputed',          // Either party raised a dispute
      'cancelled'          // Job cancelled
    ],
    default: 'open'
  },
  escrowTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Location Information (for Physical Jobs)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    // Masked location (approximate area)
    maskedAddress: {
      type: String,
      trim: true
    },
    // Exact address (revealed after deposit)
    exactAddress: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    // Radius for area circle display (in meters)
    displayRadius: {
      type: Number,
      default: 500
    }
  },
  isLocationRevealed: {
    type: Boolean,
    default: false
  },
  
  // Timeline
  deadline: {
    type: Date
  },
  startedAt: Date,
  completedAt: Date,
  
  // Work Submission
  submissionNote: {
    type: String,
    maxlength: [1000, 'Submission note cannot exceed 1000 characters']
  },
  submissionFiles: [{
    type: String // Cloudinary URLs
  }],
  submittedAt: Date,
  
  // Review & Dispute
  clientReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    createdAt: Date
  },
  freelancerReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    createdAt: Date
  },
  disputeReason: {
    type: String,
    maxlength: [1000, 'Dispute reason cannot exceed 1000 characters']
  },
  disputeRaisedBy: {
    type: String,
    enum: ['client', 'freelancer']
  },
  disputeRaisedAt: Date,
  
  // Visibility & Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coverLetter: String,
    proposedPrice: Number,
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Safety Features
  requiresPhysicalMeeting: {
    type: Boolean,
    default: false
  },
  panicButtonActivated: {
    type: Boolean,
    default: false
  },
  panicActivatedAt: Date
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
jobSchema.index({ location: '2dsphere' });

// Indexes for faster queries
jobSchema.index({ client: 1, createdAt: -1 });
jobSchema.index({ freelancer: 1, createdAt: -1 });
jobSchema.index({ category: 1, escrowStatus: 1 });
jobSchema.index({ escrowStatus: 1 });
jobSchema.index({ isActive: 1, escrowStatus: 1 });

// Pre-save middleware to set location defaults
jobSchema.pre('save', function(next) {
  if (this.jobType === 'physical' && !this.location.maskedAddress && this.location.exactAddress) {
    // Create a masked address (approximate area)
    const addressParts = this.location.exactAddress.split(',');
    if (addressParts.length > 1) {
      this.location.maskedAddress = addressParts.slice(-2).join(',').trim();
    } else {
      this.location.maskedAddress = this.location.city || 'Location available after deposit';
    }
  }
  next();
});

// Method to reveal exact location
jobSchema.methods.revealLocation = function() {
  if (this.jobType === 'physical' && this.escrowStatus === 'in_progress') {
    this.isLocationRevealed = true;
    return this.save();
  }
  throw new Error('Location can only be revealed after deposit is made');
};

// Method to update escrow status
jobSchema.methods.updateEscrowStatus = function(newStatus) {
  const validTransitions = {
    'open': ['assigned', 'cancelled'],
    'assigned': ['deposit_pending', 'cancelled'],
    'deposit_pending': ['in_progress', 'cancelled'],
    'in_progress': ['review', 'disputed', 'cancelled'],
    'review': ['completed', 'disputed', 'in_progress'],
    'disputed': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };
  
  if (!validTransitions[this.escrowStatus].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.escrowStatus} to ${newStatus}`);
  }
  
  this.escrowStatus = newStatus;
  
  // Update timestamps based on status
  if (newStatus === 'in_progress') {
    this.startedAt = new Date();
    // Reveal location for physical jobs
    if (this.jobType === 'physical') {
      this.isLocationRevealed = true;
    }
  } else if (newStatus === 'completed') {
    this.completedAt = new Date();
  } else if (newStatus === 'disputed') {
    this.disputeRaisedAt = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);
