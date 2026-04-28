const { UserMongo } = require('../models-mongo');
const { calculateLevel } = require('../utils/levelUtils');

class UserService {
    /**
     * Awards XP to a user and automatically handles leveling up.
     * @param {string} userId - The MongoDB ID of the user.
     * @param {number} xpAmount - The amount of XP to add.
     * @returns {Promise<Object>} - The updated user object.
     */
    static async awardXP(userId, xpAmount) {
        const user = await UserMongo.findById(userId);
        if (!user) return null;

        user.user_xp += xpAmount;
        const newLevel = calculateLevel(user.user_xp);
        
        if (newLevel > user.user_level) {
            console.log(`User ${user.username} leveled up to ${newLevel}!`);
            user.user_level = newLevel;
            // You could trigger a notification here too
        }

        await user.save();
        return user;
    }

    /**
     * Gets a user profile with levels and stats.
     */
    static async getProfile(userId) {
        return await UserMongo.findById(userId).select('-password');
    }
}

module.exports = UserService;
