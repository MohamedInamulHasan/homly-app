import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD for easy daily grouping
        required: true
    },
    hasBeenRewarded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure one entry per user per day (highest score)
gameScoreSchema.index({ user: 1, date: 1 }, { unique: true });

const GameScore = mongoose.model('GameScore', gameScoreSchema);

export default GameScore;
