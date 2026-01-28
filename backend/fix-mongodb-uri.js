import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

console.log('🔧 Fixing MongoDB Connection String...\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('Please create a .env file first by copying .env.example');
    process.exit(1);
}

// Read current .env
let envContent = fs.readFileSync(envPath, 'utf8');

// Find and fix the MONGODB_URI line
const mongoUriRegex = /MONGODB_URI=mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/\?]+)(\/[^\?]*)?\??(.*)/;
const match = envContent.match(mongoUriRegex);

if (!match) {
    console.error('❌ Could not find MONGODB_URI in .env file');
    console.log('Please check your .env file format');
    process.exit(1);
}

const [fullMatch, username, password, cluster, currentDb, params] = match;

console.log('Current connection string found:');
console.log(`  Username: ${username}`);
console.log(`  Cluster: ${cluster}`);
console.log(`  Database: ${currentDb || '(MISSING - this is the problem!)'}`);
console.log(`  Parameters: ${params || '(none)'}`);
console.log('');

// Create the fixed connection string
const databaseName = currentDb && currentDb !== '/' ? currentDb : '/homly-ecommerce';
const fixedParams = params || 'retryWrites=true&w=majority&appName=Cluster0';

// Make sure we have all required parameters
const requiredParams = ['retryWrites=true', 'w=majority'];
let finalParams = fixedParams;

requiredParams.forEach(param => {
    if (!finalParams.includes(param.split('=')[0])) {
        finalParams += (finalParams ? '&' : '') + param;
    }
});

const fixedUri = `MONGODB_URI=mongodb+srv://${username}:${password}@${cluster}${databaseName}?${finalParams}`;

// Replace in content
envContent = envContent.replace(mongoUriRegex, fixedUri);

// Backup original .env
const backupPath = path.join(__dirname, '.env.backup');
fs.writeFileSync(backupPath, fs.readFileSync(envPath));
console.log(`✅ Backed up original .env to .env.backup`);

// Write fixed .env
fs.writeFileSync(envPath, envContent);
console.log(`✅ Updated .env file with corrected connection string`);
console.log('');
console.log('Fixed connection string:');
console.log(`  Database: ${databaseName}`);
console.log(`  Parameters: ${finalParams}`);
console.log('');
console.log('🎯 Next steps:');
console.log('  1. Run: node test-mongodb-connection.js');
console.log('  2. If successful, run: npm start');
console.log('');
