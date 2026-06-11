const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Signup validation rules
const signupValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('userType')
    .optional()
    .isIn(['student', 'external_client']).withMessage('Invalid user type'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10,15}$/).withMessage('Please provide a valid phone number'),
  
  body('university')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('University name cannot exceed 100 characters'),
  
  validate
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// Job creation validation
const jobValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['coding', 'design', 'writing', 'tutoring', 'cleaning', 'repairs', 'delivery', 'event_help', 'other'])
    .withMessage('Invalid category'),
  
  body('jobType')
    .notEmpty().withMessage('Job type is required')
    .isIn(['digital', 'physical']).withMessage('Job type must be either digital or physical'),
  
  body('budget')
    .notEmpty().withMessage('Budget is required')
    .isNumeric().withMessage('Budget must be a number')
    .custom(value => value > 0).withMessage('Budget must be greater than 0'),
  
  validate
];

// Tribe creation validation
const tribeValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tribe name is required')
    .isLength({ max: 50 }).withMessage('Tribe name cannot exceed 50 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('tribeType')
    .notEmpty().withMessage('Tribe type is required')
    .isIn(['interest', 'location', 'academic', 'mixed']).withMessage('Invalid tribe type'),
  
  validate
];

// Message validation
const messageValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
  
  validate
];

module.exports = {
  validate,
  signupValidation,
  loginValidation,
  jobValidation,
  tribeValidation,
  messageValidation
};
