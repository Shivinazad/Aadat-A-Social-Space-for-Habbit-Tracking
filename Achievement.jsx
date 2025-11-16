import React from 'react';

// --- Icons using lucide-react (simulated) ---
const TrophyIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 15h2a3 3 0 0 0 3-3V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4a3 3 0 0 0 3 3z"/><path d="M12 22a7 7 0 0 1-7-7h14a7 7 0 0 1-7 7z"/><path d="M15 5.75c.67.57 1 1.2 1 2.25"/><path d="M9 5.75c-.67.57-1 1.2-1 2.25"/></svg>;
const TagIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l9.71 9.71a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828L12.586 2.586z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>;
const HashIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>;
const TypeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>;
const LockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

// Achievement Model Structure based on Sequelize definition
const achievementSchema = [
    { field: 'id', icon: HashIcon, type: 'INTEGER', description: 'Unique identifier', constraints: ['Primary Key', 'Auto Increment'] },
    { field: 'name', icon: TagIcon, type: 'STRING', description: 'Short, internal identifier (e.g., "streak_7_day")', constraints: ['Required', 'Unique'] },
    { field: 'displayName', icon: TypeIcon, type: 'STRING', description: 'Name shown to the user (e.g., "7-Day Streak")', constraints: ['Required'] },
    { field: 'description', icon: TypeIcon, type: 'STRING', description: 'Explanation of how to earn the achievement', constraints: ['Required'] },
    { field: 'icon', icon: TrophyIcon, type: 'STRING', description: 'Emoji or icon representation', constraints: ['Default: 🏆'] },
];

// Mock Achievement Data
const mockAchievements = [
    { id: 1, name: 'first_habit', displayName: 'The Starter', description: 'Completed your first ever habit.', icon: '🐣' },
    { id: 2, name: 'streak_7_day', displayName: '7-Day Streak', description: 'Completed any habit 7 days in a row.', icon: '🔥' },
    { id: 3, name: 'social_butterfly', displayName: 'Social Butterfly', description: 'Invited 5 friends to join Aadat.', icon: '🦋' },
];

// Component to render a single schema field row
const SchemaFieldRow = ({ fieldData }) => {
    const Icon = fieldData.icon;
    return (
        <div className="flex items-start p-4 border-b dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 transition duration-150">
            {/* Field Name and Icon */}
            <div className="flex-shrink-0 w-32">
                <p className="flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                    <Icon className="w-4 h-4 mr-2 text-indigo-500" />
                    {fieldData.field}
                </p>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono italic mt-1 block">{fieldData.type}</span>
            </div>

            {/* Description */}
            <div className="flex-1 px-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    {fieldData.description}
                </p>
            </div>

            {/* Constraints */}
            <div className="flex-shrink-0 w-48 text-right">
                {fieldData.constraints.map(constraint => (
                    <span 
                        key={constraint}
                        className="inline-flex items-center px-2 py-0.5 ml-2 text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-full"
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
 * AchievementDefinitionViewer Component
 * Displays the structure and constraints of the Achievement Sequelize model.
 */
const AchievementDefinitionViewer = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[Inter]">
            <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">

                <header className="mb-8 pb-4 border-b dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center mb-1">
                        <TrophyIcon className="w-8 h-8 mr-3 text-yellow-500 fill-yellow-100" />
                        Achievement Data Model
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Visual representation of the Sequelize model structure (`server/models/Achievement.js`).
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
                        <div className="w-32">Field / Type</div>
                        <div className="flex-1 px-4">Description</div>
                        <div className="w-48 text-right">Constraints</div>
                    </div>
                    {/* Data Rows */}
                    {achievementSchema.map((fieldData) => (
                        <SchemaFieldRow key={fieldData.field} fieldData={fieldData} />
                    ))}
                </div>


                {/* --- Mock Data Examples --- */}
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    Mock Data Examples
                </h2>

                <div className="space-y-4">
                    {mockAchievements.map(ach => (
                        <div key={ach.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="text-3xl mr-4 flex-shrink-0">{ach.icon}</div>
                            <div className="flex-1">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{ach.displayName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{ach.description}</p>
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                ID: {ach.id} | Name: {ach.name}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default AchievementDefinitionViewer;