import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    mode: {
        type: String,
        default: 'memory'
    }
}, {
    timestamps: true
});

// Index to quickly get top scores
gameScoreSchema.index({ mode: 1, score: -1 });

const GameScore = mongoose.model('GameScore', gameScoreSchema);

export default GameScore;
