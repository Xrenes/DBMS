/**
 * Password Hash Generator and Tester
 * Run: node test-password.js
 */

const bcrypt = require('bcryptjs');

// Test existing hash
const existingHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NhXmQJ4whYOhYu';
const passwords = ['password', 'password123', 'admin123'];

console.log('🔐 Testing passwords against existing hash...\n');

async function testPasswords() {
  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, existingHash);
    console.log(`Password: "${pwd}" → ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n🔑 Generating new hashes...\n');
  
  // Generate new hashes
  for (const pwd of passwords) {
    const hash = await bcrypt.hash(pwd, 10);
    console.log(`Password: "${pwd}"`);
    console.log(`Hash: ${hash}\n`);
  }
}

testPasswords();
