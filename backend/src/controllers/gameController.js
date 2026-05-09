import GameScore from '../models/GameScore.js';
import User from '../models/User.js';

// Configuration: Game is live from 6 PM to 9 PM (18:00 - 21:00)
const CHALLENGE_START_HOUR = 18;
const CHALLENGE_END_HOUR = 21;

export const getGameStatus = async (req, res, next) => {
    try {
        const now = new Date();
        const currentHour = now.getHours();
        const todayDate = now.toISOString().split('T')[0];

        const isLive = currentHour >= CHALLENGE_START_HOUR && currentHour < CHALLENGE_END_HOUR;
        
        const leaderboard = await GameScore.find({ date: todayDate })
            .sort({ score: -1 })
            .limit(10)
            .populate('user', 'name avatar');

        res.status(200).json({
            success: true,
            data: {
                isLive,
                startTime: `${CHALLENGE_START_HOUR}:00`,
                endTime: `${CHALLENGE_END_HOUR}:00`,
                todayDate,
                leaderboard
            }
        });
    } catch (error) {
        next(error);
    }
};

export const submitScore = async (req, res, next) => {
    try {
        const { score } = req.body;
        const now = new Date();
        const currentHour = now.getHours();
        const todayDate = now.toISOString().split('T')[0];

        if (currentHour < CHALLENGE_START_HOUR || currentHour >= CHALLENGE_END_HOUR) {
            res.status(400);
            throw new Error('Challenge is not currently live');
        }

        let gameScore = await GameScore.findOne({ user: req.user._id, date: todayDate });

        if (gameScore) {
            if (score > gameScore.score) {
                gameScore.score = score;
                await gameScore.save();
            }
        } else {
            gameScore = await GameScore.create({
                user: req.user._id,
                score,
                date: todayDate
            });
        }

        res.status(200).json({
            success: true,
            data: gameScore
        });
    } catch (error) {
        next(error);
    }
};

export const rewardDailyWinner = async (req, res, next) => {
    try {
        const { date } = req.body;
        
        const topScore = await GameScore.findOne({ date, hasBeenRewarded: false })
            .sort({ score: -1 })
            .populate('user');

        if (!topScore) {
            return res.status(404).json({ success: false, message: 'No winner found or already rewarded' });
        }

        const user = await User.findById(topScore.user._id);
        user.coins = (user.coins || 0) + 1;
        await user.save();

        topScore.hasBeenRewarded = true;
        await topScore.save();

        res.status(200).json({
            success: true,
            message: `Winner ${user.name} rewarded with 1 coin!`,
            data: topScore
        });
    } catch (error) {
        next(error);
    }
};
