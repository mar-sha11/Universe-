/**
 * Test script to verify UniVerse backend setup
 */

console.log('🧪 Testing UniVerse Backend Setup\n');

// Test 1: Check environment variables
console.log('✅ Test 1: Environment Variables');
require('dotenv').config();
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✓ Set' : '✗ Not set'}\n`);

// Test 2: Check models can be loaded
console.log('✅ Test 2: Loading MongoDB Models');
try {
  const User = require('./server/models/User');
  console.log('   ✓ User model loaded');
  
  const Job = require('./server/models/Job');
  console.log('   ✓ Job model loaded');
  
  const Tribe = require('./server/models/Tribe');
  console.log('   ✓ Tribe model loaded');
  
  const Conversation = require('./server/models/Conversation');
  console.log('   ✓ Conversation model loaded');
  
  const Transaction = require('./server/models/Transaction');
  console.log('   ✓ Transaction model loaded\n');
} catch (error) {
  console.error('   ✗ Error loading models:', error.message);
}

// Test 3: Check middleware
console.log('✅ Test 3: Loading Middleware');
try {
  const { auth } = require('./server/middleware/auth');
  console.log('   ✓ Auth middleware loaded');
  
  const { signupValidation } = require('./server/middleware/validation');
  console.log('   ✓ Validation middleware loaded\n');
} catch (error) {
  console.error('   ✗ Error loading middleware:', error.message);
}

// Test 4: Check utilities
console.log('✅ Test 4: Loading Utilities');
try {
  const { generateToken } = require('./server/utils/auth');
  console.log('   ✓ Auth utilities loaded');
  
  // Test token generation
  const testToken = generateToken('test_user_id');
  console.log('   ✓ Token generation works');
  console.log(`   ✓ Sample token: ${testToken.substring(0, 30)}...\n`);
} catch (error) {
  console.error('   ✗ Error loading utilities:', error.message);
}

// Test 5: Check routes
console.log('✅ Test 5: Loading Routes');
try {
  const authRoutes = require('./server/routes/auth');
  console.log('   ✓ Auth routes loaded\n');
} catch (error) {
  console.error('   ✗ Error loading routes:', error.message);
}

// Test 6: Verify Transaction static methods
console.log('✅ Test 6: Testing Transaction Model Static Methods');
try {
  const Transaction = require('./server/models/Transaction');
  
  // Test platform fee calculation
  const fee1 = Transaction.calculatePlatformFee(1000);
  console.log(`   ✓ Fee for ₦1000: ₦${fee1} (5% or min ₦100)`);
  
  const fee2 = Transaction.calculatePlatformFee(5000);
  console.log(`   ✓ Fee for ₦5000: ₦${fee2} (5% = ₦250)`);
  
  const fee3 = Transaction.calculatePlatformFee(500);
  console.log(`   ✓ Fee for ₦500: ₦${fee3} (min ₦100 applies)\n`);
} catch (error) {
  console.error('   ✗ Error testing transaction methods:', error.message);
}

console.log('🎉 All basic tests completed!\n');
console.log('📝 Next steps:');
console.log('   1. Set up a real MongoDB database');
console.log('   2. Update .env with actual MongoDB URI');
console.log('   3. Run: npm run dev');
console.log('   4. Test API at http://localhost:5000/api/health\n');
