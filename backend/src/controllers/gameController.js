import GameScore from '../models/GameScore.js';
import User from '../models/User.js';

// @desc    Submit game score
// @route   POST /api/games/score
// @access  Private
export const submitScore = async (req, res) => {
    try {
        const { score, mode = 'memory' } = req.body;

        if (score === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide a score' });
        }

        // Check if user already has a score for this mode
        let gameScore = await GameScore.findOne({ user: req.user._id, mode });
        let isNewHighScore = false;

        if (gameScore) {
            if (score > gameScore.score) {
                gameScore.score = score;
                await gameScore.save();
                isNewHighScore = true;
            }
        } else {
            gameScore = await GameScore.create({
                user: req.user._id,
                score,
                mode
            });
            isNewHighScore = true;
        }

        res.status(200).json({
            success: true,
            data: gameScore,
            isNewHighScore
        });
    } catch (error) {
        console.error('Submit Score Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get top scores (Leaderboard)
// @route   GET /api/games/leaderboard/:mode
// @access  Public
export const getLeaderboard = async (req, res) => {
    try {
        const { mode } = req.params;

        const leaderboard = await GameScore.find({ mode })
            .sort({ score: -1 })
            .limit(10)
            .populate('user', 'name avatar');

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};



// @desc    Get my score
// @route   GET /api/games/my-score/:mode
// @access  Private
export const getMyScore = async (req, res) => {
    try {
        const { mode } = req.params;
        const gameScore = await GameScore.findOne({ user: req.user._id, mode });
        
        res.status(200).json({
            success: true,
            score: gameScore ? gameScore.score : 0
        });
    } catch (error) {
        console.error('Get My Score Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
