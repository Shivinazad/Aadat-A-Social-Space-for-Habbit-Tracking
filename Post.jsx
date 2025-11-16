import React, { useState, useEffect } from 'react';

// Icons using lucide-react (assuming available)
const UserIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.66"/><path d="M9 11l3 3L22 4"/></svg>;
const ClockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const MessageSquareIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const LoaderIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;


/**
 * Helper function to format the post date
 * @param {string} dateString 
 * @returns {string} formatted date/time
 */
const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return past.toLocaleDateString();
};


/**
 * CommunityFeed Component
 * Displays a list of user posts, showing the content, author, 
 * and associated habit check-in details.
 */
const CommunityFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simulated API call to fetch feed data
    useEffect(() => {
        const fetchFeed = async () => {
            // In a real app, this would be a GET call to your backend, e.g.:
            // const response = await axios.get('http://localhost:3000/api/posts/feed');
            
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

            // --- Mock Data simulating data from Post model relations ---
            const mockPosts = [
                {
                    id: 1,
                    content: "Completed my 30 minutes of reading today! Feeling great about staying consistent.",
                    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
                    User: { username: "johnny_h", user_level: 5 }, // Relationship data from User model
                    Habit: { name: "Read 30 mins", id: 1 },         // Relationship data from Habit model
                },
                {
                    id: 2,
                    content: "Just hit the gym for my third session this week. Keep showing up!",
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                    User: { username: "habit_queen", user_level: 8 },
                    Habit: { name: "30-min Workout", id: 2 },
                },
                {
                    id: 3,
                    content: "I started tracking my water intake last week and I already feel more energized. Highly recommend!",
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                    User: { username: "new_starter_1", user_level: 1 },
                    Habit: null, // This post is a general status update (habitId is null)
                },
            ];
            // --- End Mock Data ---
            
            setPosts(mockPosts);
            setLoading(false);
        };

        fetchFeed();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 font-[Inter]">
                <LoaderIcon className="animate-spin w-8 h-8 text-indigo-500 mr-3" />
                <span className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading community updates...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl font-[Inter] w-full max-w-2xl mx-auto">
                Could not load feed: {error}
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 p-4 md:p-0 font-[Inter]">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white border-b-4 border-indigo-500/50 pb-2">
                Community Progress Feed
            </h2>
            
            {posts.length === 0 && (
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow">
                    <p className="text-gray-500 dark:text-gray-400">No posts yet. Start following users or make your first check-in!</p>
                </div>
            )}

            {posts.map(post => (
                <div 
                    key={post.id} 
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-indigo-400/30 transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                    {/* Post Header (User & Time) */}
                    <div className="p-5 flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full text-indigo-600 dark:text-indigo-400">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {post.User.username}
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Level {post.User.user_level}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-400 dark:text-gray-500">
                            <ClockIcon className="w-4 h-4" />
                            <span>{timeAgo(post.createdAt)}</span>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="px-5 pb-4 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                        {post.content}
                    </div>

                    {/* Footer (Habit Link and Engagement) */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                        {post.Habit ? (
                            <div className="flex items-center space-x-2 text-sm font-semibold text-green-700 dark:text-green-400 p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span>Completed Habit: {post.Habit.name}</span>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400 p-2">
                                General Update
                            </div>
                        )}
                        
                        {/* Mock engagement buttons */}
                        <div className="flex space-x-4">
                            <button className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition">
                                <MessageSquareIcon className="w-5 h-5 mr-1"/> 0 Comments
                            </button>
                            {/* In a real app, you might add a "Like" or "Kudos" button */}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommunityFeed;