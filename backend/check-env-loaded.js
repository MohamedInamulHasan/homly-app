
import dotenv from 'dotenv';
dotenv.config();

console.log('--- Env Check ---');
console.log('CWD:', process.cwd());
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Does it contain /test?', process.env.MONGODB_URI.includes('/test'));
