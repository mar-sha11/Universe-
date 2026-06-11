const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction Type
  type: {
    type: String,
    required: true,
    enum: ['escrow_deposit', 'escrow_release', 'escrow_refund', 'platform_fee', 'withdrawal']
  },
  
  // Related Entities
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Amount Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD']
  },
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  
  // Transaction Status
  status: {
    type: String,
    required: true,
    enum: [
      'pending',        // Awaiting payment
      'processing',     // Payment being processed
      'held',          // Funds held in escrow
      'completed',     // Transaction completed
      'failed',        // Transaction failed
      'refunded',      // Funds refunded
      'disputed'       // Under dispute
    ],
    default: 'pending'
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'card', 'wallet', 'crypto', 'cash'],
    default: 'bank_transfer'
  },
  
  // Payment Gateway Details
  paymentGateway: {
    provider: {
      type: String,
      enum: ['paystack', 'flutterwave', 'stripe', 'manual']
    },
    transactionId: String,
    reference: String
  },
  
  // Admin Wallet Info (for escrow holding)
  adminWalletId: {
    type: String
  },
  heldUntil: {
    type: Date
  },
  
  // Timeline
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  
  // Metadata
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Receipt & Proof
  receiptUrl: {
    type: String
  },
  proofOfWork: [{
    type: String // Cloudinary URLs
  }],
  
  // Dispute Information
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeDetails: {
    reason: String,
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    raisedAt: Date,
    resolution: String,
    resolvedAt: Date
  },
  
  // Audit Trail
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ job: 1 });
transactionSchema.index({ payer: 1, createdAt: -1 });
transactionSchema.index({ payee: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'paymentGateway.transactionId': 1 });

// Pre-save middleware to calculate net amount
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('platformFee')) {
    this.netAmount = this.amount - this.platformFee;
  }
  next();
});

// Method to update status
transactionSchema.methods.updateStatus = async function(newStatus, note = '') {
  const validTransitions = {
    'pending': ['processing', 'failed', 'cancelled'],
    'processing': ['held', 'completed', 'failed'],
    'held': ['completed', 'refunded', 'disputed'],
    'completed': [],
    'failed': ['pending'], // Allow retry
    'refunded': [],
    'disputed': ['completed', 'refunded']
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note
  });
  
  this.status = newStatus;
  
  // Set completion timestamp
  if (newStatus === 'completed' || newStatus === 'refunded') {
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Method to hold funds in escrow
transactionSchema.methods.holdInEscrow = async function(adminWalletId, holdDurationDays = 30) {
  if (this.status !== 'processing') {
    throw new Error('Can only hold funds from processing status');
  }
  
  this.adminWalletId = adminWalletId;
  this.heldUntil = new Date(Date.now() + holdDurationDays * 24 * 60 * 60 * 1000);
  
  return this.updateStatus('held', `Funds held in escrow until ${this.heldUntil}`);
};

// Method to release funds
transactionSchema.methods.releaseFunds = async function(note = 'Work approved') {
  if (this.status !== 'held') {
    throw new Error('Can only release funds from held status');
  }
  
  return this.updateStatus('completed', note);
};

// Method to refund
transactionSchema.methods.refund = async function(reason = '') {
  if (this.status !== 'held' && this.status !== 'disputed') {
    throw new Error('Can only refund from held or disputed status');
  }
  
  return this.updateStatus('refunded', `Refunded: ${reason}`);
};

// Method to raise dispute
transactionSchema.methods.raiseDispute = async function(userId, reason) {
  if (this.status !== 'held') {
    throw new Error('Can only dispute held transactions');
  }
  
  this.isDisputed = true;
  this.disputeDetails = {
    reason: reason,
    raisedBy: userId,
    raisedAt: new Date()
  };
  
  return this.updateStatus('disputed', `Dispute raised: ${reason}`);
};

// Static method to calculate platform fee
transactionSchema.statics.calculatePlatformFee = function(amount) {
  // 5% platform fee, minimum 100 NGN
  const feePercentage = 0.05;
  const minimumFee = 100;
  
  const calculatedFee = amount * feePercentage;
  return Math.max(calculatedFee, minimumFee);
};

module.exports = mongoose.model('Transaction', transactionSchema);
