const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { calculateLevel } = require('../utils/levelUtils');
const { emitDataChanged, emitUserDataChanged } = require('../realtime/socketEvents');
const {
    PostMongo,
    UserMongo,
    HabitMongo,
    LikeMongo,
    NotificationMongo,
    AchievementMongo,
    UserAchievementMongo
} = require('../models-mongo');
const router = express.Router();
const engine = 'mongo';

const isMongo = () => engine === 'mongo';
const toStringId = (value) => (value && value.toString ? value.toString() : value);

const populateRecentPostsMongo = (limit) => PostMongo.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'id username')
    .populate('habitId', 'id habitTitle');

const populateFeedPostsMongo = () => PostMongo.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'id username avatar')
    .populate('habitId', 'id habitTitle');

// GET /recent - Get Recent Posts (Public endpoint for landing page)
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        if (isMongo()) {
            const posts = await populateRecentPostsMongo(limit);
            return res.status(200).json(posts);
        }

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

        if (isMongo()) {
            const activeMembers = await HabitMongo.distinct('userId').then((ids) => ids.length);
            const postsToday = await PostMongo.countDocuments({ createdAt: { $gte: today } });
            const usersCheckedInToday = await PostMongo.distinct('userId', { createdAt: { $gte: today } }).then((ids) => ids.length);
            const completionRate = activeMembers > 0
                ? Math.round((usersCheckedInToday / activeMembers) * 100)
                : 0;

            return res.status(200).json({ activeMembers, postsToday, completionRate });
        }

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
        if (isMongo()) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const existingCheckin = await PostMongo.findOne({
                userId,
                habitId,
                createdAt: { $gte: today, $lt: tomorrow }
            });

            if (existingCheckin) {
                return res.status(400).json({ msg: 'You can only check in once per day for each habit. Come back tomorrow! ⏰' });
            }

            const newPost = await PostMongo.create({ content, habitId, userId });
            const habit = await HabitMongo.findById(habitId);
            let currentStreak = 0;

            if (habit && toStringId(habit.userId) === toStringId(userId)) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                if (habit.lastCheckinDate) {
                    const lastCheckin = new Date(habit.lastCheckinDate);
                    lastCheckin.setHours(0, 0, 0, 0);

                    if (lastCheckin.getTime() === yesterday.getTime()) {
                        habit.currentStreak += 1;
                    } else if (lastCheckin.getTime() < yesterday.getTime()) {
                        habit.currentStreak = 1;
                    }
                } else {
                    habit.currentStreak = 1;
                }

                currentStreak = habit.currentStreak;
                if (habit.currentStreak > habit.longestStreak) {
                    habit.longestStreak = habit.currentStreak;
                }
                habit.lastCheckinDate = new Date();
                await habit.save();
            }

            const user = await UserMongo.findById(userId);
            if (user) {
                user.user_xp += 10;
                user.user_level = calculateLevel(user.user_xp);
                await user.save();
            }

            try {
                const firstPostAch = await AchievementMongo.findOne({ name: 'first_post' });
                if (firstPostAch && !(await UserAchievementMongo.findOne({ userId, achievementId: firstPostAch._id }))) {
                    await UserAchievementMongo.create({ userId, achievementId: firstPostAch._id });
                    awardedAchievements.push(firstPostAch);
                }

                if (currentStreak >= 3) {
                    const streak3Ach = await AchievementMongo.findOne({ name: 'streak_3_day' });
                    if (streak3Ach && !(await UserAchievementMongo.findOne({ userId, achievementId: streak3Ach._id }))) {
                        await UserAchievementMongo.create({ userId, achievementId: streak3Ach._id });
                        awardedAchievements.push(streak3Ach);
                    }
                }
            } catch (achieveError) {
                console.error('Error checking/awarding achievements:', achieveError);
            }

            emitDataChanged({
                scope: 'posts',
                action: 'created',
                postId: newPost._id?.toString?.(),
                habitId: toStringId(habitId),
                userId: toStringId(userId)
            });
            emitUserDataChanged(userId, {
                scope: 'dashboard',
                action: 'checkin-created',
                habitId: toStringId(habitId)
            });

            return res.status(201).json({ message: 'Check-in successful!', post: newPost, habit, awardedAchievements });
        }

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

        emitDataChanged({
            scope: 'posts',
            action: 'created',
            postId: newPost.id,
            habitId: habitId,
            userId: userId
        });
        emitUserDataChanged(userId, {
            scope: 'dashboard',
            action: 'checkin-created',
            habitId: habitId
        });

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
        if (isMongo()) {
            const posts = await populateFeedPostsMongo();
            const userLikes = await LikeMongo.find({ userId }, { postId: 1 }).lean();
            const likedPostIds = new Set(userLikes.map((like) => toStringId(like.postId)));

            const postsWithLikeStatus = await Promise.all(posts.map(async (post) => {
                const plain = post.toObject();
                const likeCount = await LikeMongo.countDocuments({ postId: plain._id });
                return {
                    ...plain,
                    isLikedByCurrentUser: likedPostIds.has(toStringId(plain._id)),
                    likeCount
                };
            }));

            return res.status(200).json(postsWithLikeStatus);
        }

        const posts = await Post.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'username', 'avatar'] },
                { model: Habit, attributes: ['id', 'habitTitle'] }
            ]
        });
        const userLikes = await Like.findAll({ where: { userId: userId }, attributes: ['postId'] });
        const likedPostIds = new Set(userLikes.map(like => like.postId));

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
        const targetUserId = req.params.userId;
        const currentUserId = req.user.id;

        if (isMongo()) {
            const posts = await PostMongo.find({ userId: targetUserId })
                .sort({ createdAt: -1 })
                .populate('userId', 'id username avatar')
                .populate('habitId', 'id habitTitle');

            const userLikes = await LikeMongo.find({ userId: currentUserId }, { postId: 1 }).lean();
            const likedPostIds = new Set(userLikes.map((like) => toStringId(like.postId)));

            const postsWithLikeStatus = await Promise.all(posts.map(async (post) => {
                const plain = post.toObject();
                const likeCount = await LikeMongo.countDocuments({ postId: plain._id });
                return {
                    ...plain,
                    isLikedByCurrentUser: likedPostIds.has(toStringId(plain._id)),
                    likeCount
                };
            }));

            return res.status(200).json(postsWithLikeStatus);
        }

        const posts = await Post.findAll({
            where: { userId: targetUserId },
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'username', 'avatar'] },
                { model: Habit, attributes: ['id', 'habitTitle'], required: false }
            ]
        });


        const userLikes = await Like.findAll({
            where: { userId: currentUserId },
            attributes: ['postId']
        });
        const likedPostIds = new Set(userLikes.map(like => like.postId));

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
        return res.status(500).json({ msg: 'Server error fetching user posts.' });
    }
});

// POST /:id/like - Like a Post
router.post('/:id/like', auth, async (req, res) => {
    const postId = req.params.id;
    const likerUserId = req.user.id;
    try {
        if (isMongo()) {
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                return res.status(400).json({ msg: 'Invalid post id.' });
            }

            const existingLike = await LikeMongo.findOne({ userId: likerUserId, postId });
            if (existingLike) {
                return res.status(409).json({ msg: 'You have already liked this post.' });
            }

            const post = await PostMongo.findById(postId);
            if (!post) {
                return res.status(404).json({ msg: 'Post not found.' });
            }

            await LikeMongo.create({ userId: likerUserId, postId });

            const author = await UserMongo.findById(post.userId);
            if (author) {
                author.user_xp += 5;
                await author.save();

                if (toStringId(likerUserId) !== toStringId(post.userId)) {
                    await NotificationMongo.create({
                        userId: post.userId,
                        senderId: likerUserId,
                        type: 'like',
                        message: 'liked your post',
                        postId,
                        read: false
                    });
                }
            }

            emitDataChanged({
                scope: 'likes',
                action: 'created',
                postId,
                userId: toStringId(likerUserId),
                targetUserId: toStringId(post.userId)
            });
            emitUserDataChanged(post.userId, {
                scope: 'notifications',
                action: 'new-like',
                postId,
                senderId: toStringId(likerUserId)
            });

            return res.status(200).json({ message: 'Post liked successfully! Author awarded XP.' });
        }

        const existingLike = await Like.findOne({ where: { userId: likerUserId, postId: postId } });
        if (existingLike) {
            return res.status(409).json({ msg: 'You have already liked this post.' });
        }
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' });
        }
        await Like.create({ userId: likerUserId, postId: postId });
        const author = await User.findByPk(post.userId);
        if (author) {
            author.user_xp += 5;
            await author.save();

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
        emitDataChanged({
            scope: 'likes',
            action: 'created',
            postId,
            userId: likerUserId,
            targetUserId: post.userId
        });
        emitUserDataChanged(post.userId, {
            scope: 'notifications',
            action: 'new-like',
            postId,
            senderId: likerUserId
        });
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
