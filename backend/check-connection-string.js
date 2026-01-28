import dotenv from 'dotenv';

dotenv.config();

console.log('\n=== MongoDB Connection String Checker ===\n');

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file!');
    process.exit(1);
}

// Mask the password for display
const maskedUri = uri.replace(/:[^:@]+@/, ':****@');
console.log('Current connection string (masked):', maskedUri);
console.log('');

// Check for common issues
const issues = [];
const suggestions = [];

// Check 1: Protocol
if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    issues.push('❌ Connection string must start with mongodb:// or mongodb+srv://');
}

// Check 2: Check for spaces
if (uri.includes(' ')) {
    issues.push('❌ Connection string contains spaces');
    suggestions.push('Remove all spaces from the connection string');
}

// Check 3: Check for special characters in password
const passwordMatch = uri.match(/:([^:@]+)@/);
if (passwordMatch) {
    const password = passwordMatch[1];
    const specialChars = ['@', '#', '%', '!', '$', '^', '&', '*', '(', ')', '+', '=', '[', ']', '{', '}', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/'];
    const foundSpecialChars = specialChars.filter(char => password.includes(char));

    if (foundSpecialChars.length > 0) {
        issues.push(`⚠️  Password contains special characters: ${foundSpecialChars.join(', ')}`);
        suggestions.push('Special characters in password must be URL-encoded:');
        suggestions.push('  @ → %40');
        suggestions.push('  # → %23');
        suggestions.push('  % → %25');
        suggestions.push('  ! → %21');
        suggestions.push('  $ → %24');
    }
}

// Check 4: Database name
if (uri.includes('mongodb+srv://')) {
    if (!uri.includes('mongodb.net/') || uri.endsWith('mongodb.net/')) {
        issues.push('⚠️  Database name might be missing');
        suggestions.push('Add database name after cluster address: ...mongodb.net/homly-ecommerce?...');
    }
}

// Check 5: Required parameters
if (!uri.includes('retryWrites')) {
    suggestions.push('Consider adding retryWrites=true parameter');
}

// Display results
console.log('=== Analysis ===\n');

if (issues.length === 0) {
    console.log('✅ No obvious issues found in connection string format');
} else {
    console.log('Issues found:');
    issues.forEach(issue => console.log('  ' + issue));
}

if (suggestions.length > 0) {
    console.log('\nSuggestions:');
    suggestions.forEach(suggestion => console.log('  ' + suggestion));
}

console.log('\n=== Recommended Connection String Format ===\n');
console.log('mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority');
console.log('\nReplace:');
console.log('  USERNAME - your MongoDB Atlas username');
console.log('  PASSWORD - your password (URL-encoded if it has special characters)');
console.log('  cluster0.xxxxx.mongodb.net - your cluster address');
console.log('  DATABASE_NAME - your database name (e.g., homly-ecommerce)');

console.log('\n=== Next Steps ===\n');
console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
console.log('2. Click "Connect" on your cluster');
console.log('3. Choose "Connect your application"');
console.log('4. Copy the connection string');
console.log('5. Replace <password> with your actual password');
console.log('6. Replace <database> with your database name');
console.log('7. Update .env file with the corrected string');
console.log('8. Run: node test-mongodb-connection.js');
console.log('');
