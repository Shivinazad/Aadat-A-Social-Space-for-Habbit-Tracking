const { UserMongo } = require('../models-mongo');

class LeaderboardController {
    static async getTopUsers(req, res) {
        try {
            const topUsers = await UserMongo.find({}, { username: 1, user_level: 1, user_xp: 1, avatar: 1 })
                .sort({ user_xp: -1 })
                .limit(10);
            res.status(200).json(topUsers);
        } catch (error) {
            res.status(500).json({ msg: 'Server error fetching leaderboard.' });
        }
    }
}

module.exports = LeaderboardController;
