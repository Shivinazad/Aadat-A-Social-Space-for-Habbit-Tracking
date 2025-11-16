import React from 'react';

// --- Icons using lucide-react (simulated) ---
const HeartIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const HashIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>;
const UserIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const FileTextIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>;
const ClockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const LockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;


// Like Model Structure based on Sequelize definition
const likeSchema = [
    { field: 'id', icon: HashIcon, type: 'INTEGER', description: 'Unique like record ID', constraints: ['Primary Key', 'Auto Increment'] },
    { field: 'userId', icon: UserIcon, type: 'INTEGER', description: 'ID of the user who liked the post', constraints: ['Required', 'Foreign Key (User.id)', 'Composite Unique Key'] },
    { field: 'postId', icon: FileTextIcon, type: 'INTEGER', description: 'ID of the post that was liked', constraints: ['Required', 'Foreign Key (Post.id)', 'Composite Unique Key'] },
    { field: 'createdAt', icon: ClockIcon, type: 'DATE', description: 'Timestamp of when the like was created (automatic)', constraints: ['Required', 'Automatic by Sequelize'] },
];

// Mock Like Data for visualization
const mockLikes = [
    { id: 1, userId: 42, postId: 10, createdAt: '2025-11-16T10:00:00Z' },
    { id: 2, userId: 15, postId: 10, createdAt: '2025-11-16T10:05:00Z' },
    { id: 3, userId: 42, postId: 11, createdAt: '2025-11-16T11:20:00Z' },
];

// Component to render a single schema field row
const SchemaFieldRow = ({ fieldData }) => {
    const Icon = fieldData.icon;
    const isCompositeKey = fieldData.field === 'userId' || fieldData.field === 'postId';
    const isForeignKey = fieldData.constraints.some(c => c.includes('Foreign Key'));

    return (
        <div className="flex items-start p-4 border-b dark:border-gray-700 hover:bg-red-50 dark:hover:bg-gray-700 transition duration-150">
            {/* Field Name and Icon */}
            <div className="flex-shrink-0 w-36">
                <p className={`flex items-center text-sm font-semibold ${isCompositeKey ? 'text-pink-600 dark:text-pink-400' : 'text-gray-900 dark:text-white'}`}>
                    <Icon className={`w-4 h-4 mr-2 ${isCompositeKey ? 'text-pink-500' : 'text-red-500'}`} />
                    {fieldData.field}
                </p>
                <span className="text-xs text-red-600 dark:text-red-400 font-mono italic mt-1 block">{fieldData.type}</span>
            </div>

            {/* Description */}
            <div className="flex-1 px-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    {fieldData.description}
                </p>
            </div>

            {/* Constraints */}
            <div className="flex-shrink-0 w-48 text-right space-y-1">
                {fieldData.constraints.map(constraint => (
                    <span 
                        key={constraint}
                        className={`inline-flex items-center px-2 py-0.5 ml-2 text-xs font-medium rounded-full ${
                            constraint.includes('Primary Key') ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                            isForeignKey ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200' :
                            constraint.includes('Composite Unique Key') ? 'bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200' :
                            'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                        }`}
                    >
                        {constraint.includes('Key') ? <LockIcon className="w-3 h-3 mr-1" /> : null}
                        {constraint}
                    </span>
                ))}
            </div>
        </div>
    );
};


/**
 * LikeModelViewer Component
 * Displays the structure and constraints of the Like Sequelize model.
 */
const LikeModelViewer = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[Inter]">
            <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">

                <header className="mb-8 pb-4 border-b dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center mb-1">
                        <HeartIcon className="w-8 h-8 mr-3 text-pink-600 fill-pink-100" />
                        Social Engagement Data Model (Like)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Junction table schema for managing User-Post likes (`server/models/Like.js`).
                    </p>
                </header>

                {/* --- Schema Definition --- */}
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                    Database Schema Fields
                </h2>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-8">
                    {/* Header Row */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 font-bold text-xs uppercase text-gray-600 dark:text-gray-300 p-4 tracking-wider">
                        <div className="w-36">Field / Type</div>
                        <div className="flex-1 px-4">Description</div>
                        <div className="w-48 text-right">Constraints</div>
                    </div>
                    {/* Data Rows */}
                    {likeSchema.map((fieldData) => (
                        <SchemaFieldRow key={fieldData.field} fieldData={fieldData} />
                    ))}
                </div>


                {/* --- Composite Key Explanation --- */}
                <div className="p-4 mb-8 bg-pink-100 dark:bg-pink-900 border-l-4 border-pink-500 rounded-r-lg shadow-inner">
                    <p className="font-bold text-pink-800 dark:text-pink-300 mb-1">
                        🔑 Composite Unique Key (`userId`, `postId`)
                    </p>
                    <p className="text-sm text-pink-700 dark:text-pink-400">
                        This constraint is essential for the frontend. It guarantees that **a single user can only have one like record for a single post**. If a user tries to like a post they already liked, the server should return an error (or silently ignore the request), and the frontend needs to handle toggling the like state.
                    </p>
                </div>


                {/* --- Mock Data Examples --- */}
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    Mock Like Records
                </h2>

                <div className="space-y-3">
                    {mockLikes.map(like => (
                        <div key={like.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <HeartIcon className="w-5 h-5 text-red-500" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Like ID: {like.id}</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                User <span className="text-blue-500 dark:text-blue-300">#{like.userId}</span> liked Post <span className="text-green-500 dark:text-green-300">#{like.postId}</span>
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                @ {new Date(like.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default LikeModelViewer;