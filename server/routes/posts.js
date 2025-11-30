const express = require('express');
const { Op } = require('sequelize');
const Post = require('../models/Post');
const User = require('../models/User');
const Habit = require('../models/Habit');
const Like = require('../models/Like');
const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const auth = require('../middleware/auth');
const { calculateLevel } = require('../utils/levelUtils');
const router = express.Router();

// GET /recent - Get Recent Posts (Public endpoint for landing page)
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const posts = await Post.findAll({
            limit,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                },
                {
                    model: Habit,
                    attributes: ['id', 'habitTitle']
                }
            ]
        });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching recent posts:', error);
        res.status(500).json({ msg: 'Server error fetching recent posts.' });
    }
});

// GET /stats/community - Get Community Statistics
router.get('/stats/community', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count active members (users with at least one habit)
        const activeMembers = await User.count({
            include: [{
                model: Habit,
                required: true
            }],
            distinct: true
        });

        // Count posts created today
        const postsToday = await Post.count({
            where: {
                createdAt: {
                    [Op.gte]: today
                }
            }
        });

        // Calculate completion rate (users who checked in today vs total active users)
        const usersCheckedInToday = await Post.count({
            where: {
                createdAt: {
                    [Op.gte]: today
                }
            },
            distinct: true,
            col: 'userId'
        });

        const completionRate = activeMembers > 0
            ? Math.round((usersCheckedInToday / activeMembers) * 100)
            : 0;

        res.status(200).json({
            activeMembers,
            postsToday,
            completionRate
        });
    } catch (error) {
        console.error('Error fetching community stats:', error);
        res.status(500).json({ msg: 'Server error fetching community stats.' });
    }
});

// POST / - Create Post (Check-in)
router.post('/', auth, async (req, res) => {
    const { content, habitId } = req.body;
    const userId = req.user.id;
    if (!content || !habitId) { return res.status(400).json({ msg: 'Post content and habitId are required.' }); }

    let awardedAchievements = [];
    try {
        // Check if user already checked in today for this habit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingCheckin = await Post.findOne({
            where: {
                userId: userId,
                habitId: habitId,
                createdAt: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            }
        });

        if (existingCheckin) {
            return res.status(400).json({ msg: 'You can only check in once per day for each habit. Come back tomorrow! ⏰' });
        }

        const newPost = await Post.create({ content, habitId, userId });
        const habit = await Habit.findByPk(habitId);
        let currentStreak = 0;
        if (habit && habit.userId === userId) {
            // Check if last check-in was yesterday to maintain streak
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (habit.lastCheckinDate) {
                const lastCheckin = new Date(habit.lastCheckinDate);
                lastCheckin.setHours(0, 0, 0, 0);

                if (lastCheckin.getTime() === yesterday.getTime()) {
                    // Consecutive day - increment streak
                    habit.currentStreak += 1;
                } else if (lastCheckin.getTime() < yesterday.getTime()) {
                    // Missed day(s) - streak was broken: reset to 0, then
                    // today's check-in starts a new streak (so we increment below).
                    habit.currentStreak = 0;
                    habit.currentStreak += 1;
                }
                // If lastCheckin is today, this shouldn't happen due to check above
            } else {
                // First check-in ever
                habit.currentStreak = 1;
            }

            currentStreak = habit.currentStreak;
            if (habit.currentStreak > habit.longestStreak) { habit.longestStreak = habit.currentStreak; }
            habit.lastCheckinDate = new Date();
            await habit.save();
        }
        const user = await User.findByPk(userId);
        if (user) {
            user.user_xp += 10;
            user.user_level = calculateLevel(user.user_xp);
            await user.save();
        }

        // Achievement Check Logic
        try {
            const firstPostAch = await Achievement.findOne({ where: { name: 'first_post' } });
            if (firstPostAch && !(await UserAchievement.findOne({ where: { userId, achievementId: firstPostAch.id } }))) {
                await UserAchievement.create({ userId, achievementId: firstPostAch.id });
                awardedAchievements.push(firstPostAch);
            }
            if (currentStreak >= 3) {
                const streak3Ach = await Achievement.findOne({ where: { name: 'streak_3_day' } });
                if (streak3Ach && !(await UserAchievement.findOne({ where: { userId, achievementId: streak3Ach.id } }))) {
                    await UserAchievement.create({ userId, achievementId: streak3Ach.id });
                    awardedAchievements.push(streak3Ach);
                }
            }
        } catch (achieveError) { console.error("Error checking/awarding achievements:", achieveError); }

        return res.status(201).json({ message: 'Check-in successful!', post: newPost, habit: habit, awardedAchievements: awardedAchievements });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ msg: 'Server error creating post.' });
    }
});

// GET / - Get Feed Posts (with Like status)
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'username', 'avatar'] },
                { model: Habit, attributes: ['id', 'habitTitle'] }
            ]
        });
        const userLikes = await Like.findAll({ where: { userId: userId }, attributes: ['postId'] });
        const likedPostIds = new Set(userLikes.map(like => like.postId));

        // Get like counts for all posts
        const postsWithLikeStatus = await Promise.all(posts.map(async (postInstance) => {
            const post = postInstance.get({ plain: true });
            const likeCount = await Like.count({ where: { postId: post.id } });
            return {
                ...post,
                isLikedByCurrentUser: likedPostIds.has(post.id),
                likeCount
            };
        }));

        return res.status(200).json(postsWithLikeStatus);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ msg: 'Server error fetching posts.' });
    }
});

// GET /user/:userId - Get Posts for a specific user
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.userId);
        const currentUserId = req.user.id;

        console.log('=== FETCHING USER POSTS ===');
        console.log('Target user ID:', targetUserId);
        console.log('Current user ID:', currentUserId);

        // Fetch posts for the target user
        const posts = await Post.findAll({
            where: { userId: targetUserId },
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'username', 'avatar'] },
                { model: Habit, attributes: ['id', 'habitTitle'], required: false }
            ]
        });

        console.log(`Found ${posts.length} posts for user ${targetUserId}`);

        // Add like information
        const userLikes = await Like.findAll({
            where: { userId: currentUserId },
            attributes: ['postId']
        });
        const likedPostIds = new Set(userLikes.map(like => like.postId));

        // Get like counts for all posts
        const postsWithLikeStatus = await Promise.all(posts.map(async (postInstance) => {
            const post = postInstance.get({ plain: true });
            const likeCount = await Like.count({ where: { postId: post.id } });
            return {
                ...post,
                isLikedByCurrentUser: likedPostIds.has(post.id),
                likeCount
            };
        }));

        return res.status(200).json(postsWithLikeStatus);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        console.error('Full error:', error);
        return res.status(500).json({ msg: 'Server error fetching user posts.' });
    }
});

// POST /:id/like - Like a Post
router.post('/:id/like', auth, async (req, res) => {
    const postId = req.params.id;
    const likerUserId = req.user.id;
    try {
        const existingLike = await Like.findOne({ where: { userId: likerUserId, postId: postId } });
        if (existingLike) {
            return res.status(409).json({ msg: 'You have already liked this post.' });
        }
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        await Like.create({ userId: likerUserId, postId: postId });
        const author = await User.findByPk(post.userId); // Ensure post model includes userId
        if (author) {
            author.user_xp += 5; // Award XP
            await author.save();

            // Create notification for post author (if not liking own post)
            if (likerUserId !== post.userId) {
                const liker = await User.findByPk(likerUserId);
                await Notification.create({
                    userId: post.userId,
                    senderId: likerUserId,
                    type: 'like',
                    message: `liked your post`,
                    postId: postId,
                    read: false
                });
            }
        }
        return res.status(200).json({ message: 'Post liked successfully! Author awarded XP.' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ msg: 'You have already liked this post.' });
        }
        console.error('Error liking post:', error);
        return res.status(500).json({ msg: 'Server error liking post.' });
    }
});

module.exports = router;
