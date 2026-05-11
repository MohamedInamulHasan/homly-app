import cron from 'node-cron';
import GameScore from '../models/GameScore.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';

export const initCronJobs = () => {
    // Run every day at 5:00 PM (Server Time)
    // '0 17 * * *'
    cron.schedule('0 17 * * *', async () => {
        console.log('⏰ [CRON] Running daily Game Leaderboard reward check (5:00 PM IST)...');
        try {
            // 1. Find the highest score value for the 'memory' game mode
            const topRecord = await GameScore.findOne({ mode: 'memory' }).sort({ score: -1 });

            if (topRecord && topRecord.score > 0) {
                const highestScore = topRecord.score;
                
                // 2. Find ALL users who reached this highest score (handling ties)
                const winners = await GameScore.find({ mode: 'memory', score: highestScore }).populate('user');

                console.log(`🏆 [CRON] Found ${winners.length} winner(s) with score: ${highestScore}`);

                for (const winnerRecord of winners) {
                    if (winnerRecord.user) {
                        const user = await User.findById(winnerRecord.user._id);
                        if (user) {
                            user.coins = (user.coins || 0) + 1;
                            await user.save();

                            console.log(`✨ [CRON] Awarded 1 coin to ${user.name}`);

                            // Send real-time update to the winner if they are online
                            const io = getIO();
                            if (io) {
                                io.to(`user:${user._id}`).emit('user:updated', user);
                            }
                        }
                    }
                }
            } else {
                console.log('🤷 [CRON] No scores found for today. No reward given.');
            }

            // 3. Reset the leaderboard so the next day starts fresh
            await GameScore.deleteMany({ mode: 'memory' });
            console.log('🧹 [CRON] Leaderboard cleared for the next day.');

        } catch (error) {
            console.error('❌ [CRON] Error executing daily leaderboard reward:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('🕒 Daily Rewards Cron Job Initialized (Runs at 5:00 PM every day)');
};
