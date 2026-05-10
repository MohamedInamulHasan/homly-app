import cron from 'node-cron';
import GameScore from '../models/GameScore.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';

export const initCronJobs = () => {
    // Run every day at 5:00 PM (Server Time)
    // '0 17 * * *'
    cron.schedule('0 17 * * *', async () => {
        console.log('⏰ [CRON] Running daily Game Leaderboard reward check...');
        try {
            // Find the top score for the 'memory' game mode
            const topScore = await GameScore.findOne({ mode: 'memory' })
                .sort({ score: -1 })
                .populate('user');

            if (topScore && topScore.user) {
                const winnerId = topScore.user._id;
                
                // Award 1 coin to the winner
                const user = await User.findById(winnerId);
                if (user) {
                    user.coins = (user.coins || 0) + 1;
                    await user.save();

                    console.log(`🏆 [CRON] Awarded 1 coin to ${user.name} (Score: ${topScore.score})`);

                    // Send real-time update to the winner if they are online
                    getIO().to(`user:${user._id}`).emit('user:updated', user);
                    
                    // You could also emit a global notification here:
                    // getIO().emit('notification', { title: 'Daily Winner!', body: `${user.name} won today's Mind Match competition!` });
                }
            } else {
                console.log('🤷 [CRON] No scores found for today. No reward given.');
            }

            // Reset the leaderboard so the next day starts fresh
            await GameScore.deleteMany({ mode: 'memory' });
            console.log('🧹 [CRON] Leaderboard cleared for the next day.');

        } catch (error) {
            console.error('❌ [CRON] Error executing daily leaderboard reward:', error);
        }
    });

    console.log('🕒 Daily Rewards Cron Job Initialized (Runs at 5:00 PM every day)');
};
