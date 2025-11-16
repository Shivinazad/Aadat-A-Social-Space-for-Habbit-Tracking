import React, { useState, useEffect } from 'react';

// --- Icons using lucide-react ---
const BookOpenIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13h10"/><path d="M2 6h4"/><path d="M12 6h10"/><path d="M12 20h10"/><path d="M6 20h4"/><path d="M2 20h2"/><path d="M12 13h10"/><path d="M12 6h10"/><path d="M12 20h10"/><path d="M2 20h4"/></svg>;
const DumbbellIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4a2.4 2.4 0 0 0 0 3.39L16.6 20 20 20l2 2"/><path d="M9.6 9.6a2.4 2.4 0 0 0 0 3.39L7.4 16 4 16l-2-2"/><path d="M16 7.4l-3.2 3.2"/><path d="M7.4 16l3.2-3.2"/></svg>;
const SunIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>;
const FlameIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.2-1-2-2-3-1 0-2 .8-2 2h0a2.5 2.5 0 0 0 5 0c0-1.3-1-2-2-3 0 0 1-2 2-2 2 0 4 2 4 4a6.2 6.2 0 0 1-5 6z"/><path d="M18 19c-1 0-2-.8-2-2 0-1 1-2 2-2h0a2.5 2.5 0 0 0 5 0c0-1.2-1-2-2-3 0 0 1-2 2-2 2 0 4 2 4 4a6.2 6.2 0 0 1-5 6z"/><path d="M8 22c-1 0-2-.8-2-2 0-1 1-2 2-2h0a2.5 2.5 0 0 0 5 0c0-1.2-1-2-2-3 0 0 1-2 2-2 2 0 4 2 4 4a6.2 6.2 0 0 1-5 6z"/></svg>;
const CheckIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const PlusIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;


/**
 * Helper function to map category to icon and color
 */
const getCategoryDetails = (category) => {
    switch (category) {
        case 'Fitness':
            return { icon: DumbbellIcon, color: 'text-red-500', bg: 'bg-red-100', hover: 'hover:bg-red-200' };
        case 'Mindfulness':
            return { icon: SunIcon, color: 'text-yellow-600', bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200' };
        case 'Learning':
            return { icon: BookOpenIcon, color: 'text-indigo-600', bg: 'bg-indigo-100', hover: 'hover:bg-indigo-200' };
        default:
            return { icon: PlusIcon, color: 'text-gray-500', bg: 'bg-gray-100', hover: 'hover:bg-gray-200' };
    }
};

/**
 * Checks if the habit has already been checked in today
 * (Simplified check for demo purposes)
 */
const isCheckedInToday = (lastCheckinDate) => {
    if (!lastCheckinDate) return false;
    const lastCheckin = new Date(lastCheckinDate);
    const today = new Date();
    return lastCheckin.toDateString() === today.toDateString();
};

/**
 * HabitTrackerDashboard Component
 * Displays the list of user habits, their streaks, and check-in functionality.
 */
const HabitTrackerDashboard = () => {
    // Simulated initial state based on your Habit model
    const [habits, setHabits] = useState([
        {
            id: 1,
            habitTitle: "Read 10 pages of a book",
            habitCategory: "Learning",
            startDate: "2024-10-01",
            currentStreak: 7,
            longestStreak: 12,
            lastCheckinDate: new Date().toDateString(), // Checked in today for demo
            userId: 1,
        },
        {
            id: 2,
            habitTitle: "30-Minute Bodyweight Workout",
            habitCategory: "Fitness",
            startDate: "2024-09-15",
            currentStreak: 3,
            longestStreak: 20,
            lastCheckinDate: "2024-11-14", // Checked in yesterday
            userId: 1,
        },
        {
            id: 3,
            habitTitle: "Meditate for 10 minutes",
            habitCategory: "Mindfulness",
            startDate: "2024-11-01",
            currentStreak: 15,
            longestStreak: 15,
            lastCheckinDate: "2024-11-13", // Checked in two days ago (Streak break imminent)
            userId: 1,
        },
    ]);
    const [loading, setLoading] = useState(false); // Assume fast loading for this demo

    // Mock function to handle habit check-in
    const handleCheckIn = (habitId) => {
        // In a real app, this would be an API call: POST /api/habits/checkin/:habitId
        setLoading(true);

        setTimeout(() => {
            setHabits(prevHabits => 
                prevHabits.map(habit => {
                    if (habit.id === habitId && !isCheckedInToday(habit.lastCheckinDate)) {
                        const newStreak = habit.currentStreak + 1;
                        return {
                            ...habit,
                            currentStreak: newStreak,
                            longestStreak: Math.max(newStreak, habit.longestStreak),
                            lastCheckinDate: new Date().toDateString(),
                        };
                    }
                    return habit;
                })
            );
            setLoading(false);
        }, 500); // Simulate API response time
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[Inter]">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 border-b-4 border-indigo-500/50 pb-2">
                    My Daily Habits
                </h1>
                
                {loading && (
                     <div className="p-4 mb-4 text-sm text-indigo-700 bg-indigo-100 rounded-lg dark:bg-indigo-900 dark:text-indigo-300">
                        Processing check-in...
                    </div>
                )}

                <div className="space-y-6">
                    {habits.map((habit) => {
                        const { icon: Icon, color, bg, hover } = getCategoryDetails(habit.habitCategory);
                        const checkedIn = isCheckedInToday(habit.lastCheckinDate);
                        const streakWarning = !checkedIn && (new Date(habit.lastCheckinDate).toDateString() !== new Date(Date.now() - 86400000).toDateString());

                        return (
                            <div 
                                key={habit.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col md:flex-row justify-between items-center transition duration-300 transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700"
                            >
                                {/* Habit Info */}
                                <div className="flex items-start space-x-4 w-full md:w-2/3 mb-4 md:mb-0">
                                    <div className={`p-3 rounded-full ${bg} ${color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                            {habit.habitTitle}
                                        </h2>
                                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700">
                                            {habit.habitCategory}
                                        </span>
                                        {streakWarning && (
                                            <p className="text-sm text-red-500 font-medium mt-1">
                                                🚨 Streak at risk! Last check-in was before yesterday.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Streaks and Check-in Button */}
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full md:w-1/3 md:justify-end">
                                    
                                    {/* Streak Display */}
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                                                {habit.currentStreak}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Current Streak
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">
                                                {habit.longestStreak}
                                            </p>
                                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                                Longest Streak
                                            </p>
                                        </div>
                                    </div>

                                    {/* Check-in Button */}
                                    <button
                                        onClick={() => handleCheckIn(habit.id)}
                                        disabled={checkedIn || loading}
                                        className={`
                                            w-full sm:w-auto px-6 py-3 rounded-full font-bold text-sm shadow-md transition duration-200 
                                            flex items-center justify-center space-x-2
                                            ${checkedIn 
                                                ? 'bg-green-500 text-white cursor-default opacity-80' 
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
                                            }
                                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {checkedIn ? (
                                            <>
                                                <CheckIcon className="w-5 h-5" />
                                                <span>Checked In!</span>
                                            </>
                                        ) : (
                                            <>
                                                <FlameIcon className="w-5 h-5 animate-pulse" />
                                                <span>Check In</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Footer Action */}
                <div className="mt-8 text-center">
                    <button className="flex items-center justify-center mx-auto space-x-2 px-6 py-3 text-lg font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 rounded-full shadow-xl hover:shadow-indigo-300/50 transition transform hover:-translate-y-0.5 border-2 border-indigo-400">
                        <PlusIcon className="w-6 h-6"/>
                        <span>Add New Habit</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HabitTrackerDashboard;