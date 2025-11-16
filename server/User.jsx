import React, { useState, useEffect } from 'react';

// Icons using lucide-react (assuming available)
const StarIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ZapIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const LoaderIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

/**
 * UserStatus Component
 * Displays the user's username, level, and XP progress,
 * mirroring the data fields defined in the Sequelize User model.
 */
const UserStatus = () => {
    // Defines the data structure based on your Sequelize model
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simulated API call to fetch user status
    useEffect(() => {
        const fetchUserStatus = async () => {
            // In a real application, you would make an axios call here, e.g.:
            // const token = localStorage.getItem('aadat_token');
            // const response = await axios.get('http://localhost:3000/api/users/status', { headers: { Authorization: `Bearer ${token}` } });
            
            // --- Simulated Mock Data ---
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            const mockData = {
                username: "habit_champion_87",
                user_level: 5,
                user_xp: 450,
            };
            // The XP required to reach the next level (Level 6)
            const XP_FOR_NEXT_LEVEL = 1000; 
            // --- End Mock Data ---

            setUser({
                ...mockData,
                XP_FOR_NEXT_LEVEL
            });
            setLoading(false);
        };

        fetchUserStatus();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 font-[Inter]">
                <LoaderIcon className="animate-spin w-6 h-6 text-indigo-500 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">Loading user status...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl font-[Inter]">
                Error loading profile: {error}
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Calculate XP progress for the progress bar
    const xp_progress = (user.user_xp / user.XP_FOR_NEXT_LEVEL) * 100;

    return (
        <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-5 font-[Inter] transition-shadow duration-300 hover:shadow-indigo-500/30">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                {user.username}'s Status
            </h3>

            {/* Level Display */}
            <div className="flex items-center space-x-4 bg-indigo-50 dark:bg-indigo-900/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700">
                <StarIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Level</p>
                    <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
                        {user.user_level}
                    </p>
                </div>
            </div>

            {/* XP and Progress Bar */}
            <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-800 dark:text-gray-200">
                    <ZapIcon className="w-6 h-6 text-yellow-500" />
                    <span className="font-semibold text-xl">XP: {user.user_xp} / {user.XP_FOR_NEXT_LEVEL}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                    <div 
                        className="bg-indigo-500 h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${xp_progress > 100 ? 100 : xp_progress}%` }}
                        role="progressbar"
                        aria-valuenow={user.user_xp}
                        aria-valuemin="0"
                        aria-valuemax={user.XP_FOR_NEXT_LEVEL}
                    ></div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-1">
                    Complete more habits to reach Level {user.user_level + 1}!
                </p>
            </div>
        </div>
    );
};

export default UserStatus;