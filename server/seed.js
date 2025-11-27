// server/seed.js
// Run this script to populate the database with initial data

require('dotenv').config();
const sequelize = require('./db');
const Achievement = require('./models/Achievement');

const achievements = [
  {
    name: 'first_post',
    displayName: 'First Steps',
    description: 'Share your first check-in with the community',
    icon: '🎉'
  },
  {
    name: 'streak_3_day',
    displayName: '3-Day Streak',
    description: 'Maintain a habit for 3 consecutive days',
    icon: '🔥'
  },
  {
    name: 'streak_7_day',
    displayName: 'Week Warrior',
    description: 'Complete a full week of consistency',
    icon: '🗓️'
  },
  {
    name: 'streak_30_day',
    displayName: 'Month Master',
    description: 'Build a habit for 30 days straight',
    icon: '🏆'
  },
  {
    name: 'streak_100_day',
    displayName: 'Century Club',
    description: 'Achieve a 100-day streak',
    icon: '💯'
  },
  {
    name: 'level_5',
    displayName: 'Rising Star',
    description: 'Reach level 5 in your journey',
    icon: '⭐'
  },
  {
    name: 'level_10',
    displayName: 'Habit Champion',
    description: 'Reach level 10 - you\'re unstoppable',
    icon: '🚀'
  },
  {
    name: 'community_joiner',
    displayName: 'Social Butterfly',
    description: 'Join your first community',
    icon: '🦋'
  },
  {
    name: 'first_like',
    displayName: 'Supportive Friend',
    description: 'Give your first like to support others',
    icon: '❤️'
  },
  {
    name: 'habit_creator',
    displayName: 'Habit Architect',
    description: 'Create your first habit',
    icon: '🎯'
  },
  {
    name: 'five_habits',
    displayName: 'Multi-Tasker',
    description: 'Track 5 different habits',
    icon: '📋'
  },
  {
    name: 'early_bird',
    displayName: 'Early Bird',
    description: 'Check in before 8 AM',
    icon: '🌅'
  }
];

async function seed() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');

    // Insert achievements
    let created = 0;
    let existing = 0;

    for (const achievementData of achievements) {
      const [achievement, isNew] = await Achievement.findOrCreate({
        where: { name: achievementData.name },
        defaults: achievementData
      });

      if (isNew) {
        created++;
        console.log(`  ✅ Created: ${achievement.displayName}`);
      } else {
        existing++;
        console.log(`  ⏭️  Exists: ${achievement.displayName}`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`   Created: ${created} achievements`);
    console.log(`   Existing: ${existing} achievements`);
    console.log(`   Total: ${achievements.length} achievements\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
