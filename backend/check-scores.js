import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GameScore from './src/models/GameScore.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const counts = await GameScore.countDocuments();
        console.log('Total GameScores:', counts);
        
        const all = await GameScore.find({}).limit(5);
        console.log('Sample Scores:', JSON.stringify(all, null, 2));
        
        const memoryScores = await GameScore.find({ mode: 'memory' }).countDocuments();
        console.log('Memory Scores:', memoryScores);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
