import React from 'react';

// --- Icons using lucide-react (simulated) ---
const BellIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.36 17.51a2 2 0 1 0 3.28 0"/></svg>;
const HashIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>;
const UserIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MessageSquareIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const FileTextIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>;
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
const TypeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>;
const LockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const HeartIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const StarIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

const getIconForType = (type) => {
    switch(type) {
        case 'like': return <HeartIcon className="w-5 h-5 text-red-500" />;
        case 'follow': return <UserIcon className="w-5 h-5 text-blue-500" />;
        case 'achievement': return <StarIcon className="w-5 h-5 text-yellow-500" />;
        case 'comment': return <MessageSquareIcon className="w-5 h-5 text-green-500" />;
        default: return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
}

// Notification Model Structure
const notificationSchema = [
    { field: 'id', icon: HashIcon, type: 'INTEGER', description: 'Unique notification ID', constraints: ['Primary Key', 'Auto Increment'] },
    { field: 'userId', icon: UserIcon, type: 'INTEGER', description: 'ID of the recipient user', constraints: ['Required', 'Foreign Key (Users.id)'] },
    { field: 'senderId', icon: UserIcon, type: 'INTEGER', description: 'ID of the user who triggered the notification', constraints: ['Optional', 'Foreign Key (Users.id)'] },
    { field: 'type', icon: TypeIcon, type: 'STRING', description: "Category: 'like', 'comment', 'follow', 'achievement', etc.", constraints: ['Required'] },
    { field: 'message', icon: MessageSquareIcon, type: 'STRING', description: 'The rendered text content of the notification', constraints: ['Required'] },
    { field: 'postId', icon: FileTextIcon, type: 'INTEGER', description: 'Optional reference to the related Post', constraints: ['Optional', 'Foreign Key (Posts.id)'] },
    { field: 'read', icon: CheckCircleIcon, type: 'BOOLEAN', description: 'Status of whether the user has viewed the notification', constraints: ['Default: false'] },
    { field: 'createdAt', icon: BellIcon, type: 'DATE', description: 'Timestamp of notification creation (automatic)', constraints: ['Automatic by Sequelize'] },
];

// Mock Notifications Data
const mockNotifications = [
    { id: 1, type: 'like', message: 'User Alice liked your latest post.', read: false, senderId: 101, postId: 201, timestamp: '1m ago' },
    { id: 2, type: 'follow', message: 'Bob is now following you.', read: true, senderId: 102, postId: null, timestamp: '1h ago' },
    { id: 3, type: 'achievement', message: 'You earned the "Streak Master" achievement!', read: false, senderId: null, postId: null, timestamp: '3h ago' },
    { id: 4, type: 'comment', message: 'Charlie commented on your habit check-in.', read: true, senderId: 103, postId: 205, timestamp: '1d ago' },
];

// Component to render a single schema field row
const SchemaFieldRow = ({ fieldData }) => {
    const Icon = fieldData.icon;
    const isForeignKey = fieldData.constraints.some(c => c.includes('Foreign Key'));

    return (
        <div className="flex items-start p-4 border-b dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 transition duration-150">
            {/* Field Name and Icon */}
            <div className="flex-shrink-0 w-36">
                <p className={`flex items-center text-sm font-semibold ${isForeignKey ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                    <Icon className={`w-4 h-4 mr-2 ${isForeignKey ? 'text-purple-500' : 'text-indigo-500'}`} />
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
            <div className="flex-shrink-0 w-48 text-right space-y-1">
                {fieldData.constraints.map(constraint => (
                    <span 
                        key={constraint}
                        className={`inline-flex items-center px-2 py-0.5 ml-2 text-xs font-medium rounded-full ${
                            constraint.includes('Key') ? 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200' :
                            constraint.includes('Optional') ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200' :
                            'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'
                        }`}
                    >
                        {constraint.includes('Primary Key') ? <LockIcon className="w-3 h-3 mr-1" /> : null}
                        {constraint}
                    </span>
                ))}
            </div>
        </div>
    );
};


// Component to render a mock notification feed item
const NotificationItem = ({ notification }) => {
    return (
        <div className={`flex items-start p-4 rounded-xl transition duration-200 ${
            notification.read 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100' 
                : 'bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white border-l-4 border-indigo-500'
        }`}>
            <div className="flex-shrink-0 mr-3 mt-1">
                {getIconForType(notification.type)}
            </div>
            <div className="flex-1">
                <p className={`text-sm ${notification.read ? 'text-gray-500 dark:text-gray-400' : 'font-medium'}`}>
                    {notification.message}
                </p>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center space-x-2">
                    <span>{notification.timestamp}</span>
                    {notification.postId && (
                        <span className="text-indigo-400 dark:text-indigo-300 font-mono">
                            (Post ID: {notification.postId})
                        </span>
                    )}
                </div>
            </div>
            {!notification.read && (
                <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full ml-4 mt-2" title="Unread"></span>
            )}
        </div>
    );
}

/**
 * NotificationModelViewer Component
 * Displays the structure and constraints of the Notification Sequelize model.
 */
const NotificationModelViewer = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[Inter]">
            <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">

                <header className="mb-8 pb-4 border-b dark:border-gray-700">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center mb-1">
                        <BellIcon className="w-8 h-8 mr-3 text-indigo-600 fill-indigo-100" />
                        Notification Data Model
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Detailed schema for the **Notification** entity (`server/models/Notification.js`) that handles user alerts.
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
                    {notificationSchema.map((fieldData) => (
                        <SchemaFieldRow key={fieldData.field} fieldData={fieldData} />
                    ))}
                </div>


                {/* --- Mock Notification Feed Example --- */}
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    Client-Side Notification Feed
                </h2>

                <div className="max-w-xl mx-auto space-y-3 p-4 bg-gray-200 dark:bg-gray-900 rounded-xl">
                    {mockNotifications.map(n => (
                        <NotificationItem key={n.id} notification={n} />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default NotificationModelViewer;