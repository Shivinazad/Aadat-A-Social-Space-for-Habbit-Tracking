import React, { useState, useEffect } from 'react';

// --- Icons using lucide-react ---
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.66"/><path d="M9 11l3 3L22 4"/></svg>;
const ServerIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6" y1="6" y2="6"/><line x1="6" x2="6" y1="18" y2="18"/></svg>;
const LoaderIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

// Configuration derived from server/db.js
const DB_CONFIG = {
    database: 'aadat_db',
    user: 'root',
    host: 'localhost',
    dialect: 'MySQL',
};

/**
 * DatabaseConnectionStatus Component
 * Simulates and displays the status of the backend database connection based
 * on the provided configuration.
 */
const DatabaseConnectionStatus = () => {
    const [status, setStatus] = useState('initializing'); // initializing, connected, error
    const [message, setMessage] = useState('Attempting to synchronize models...');

    useEffect(() => {
        // --- SIMULATING BACKEND CONNECTION & SYNCHRONIZATION ---
        // In a real application, this component would fetch the health status 
        // from a secured backend endpoint, not simulate it directly.
        const simulateConnection = async () => {
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            // Simulate a successful connection and model synchronization
            if (Math.random() > 0.1) { // 90% chance of success
                setStatus('connected');
                setMessage('Successfully connected and models synchronized.');
            } else {
                setStatus('error');
                setMessage('Connection failed: Check backend configuration and MySQL server status.');
            }
        };

        simulateConnection();
    }, []);

    const StatusBadge = () => {
        let classes = "flex items-center text-sm font-semibold px-3 py-1 rounded-full";
        let icon = null;
        let text = "";

        switch (status) {
            case 'connected':
                classes += " bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
                icon = <CheckCircleIcon className="w-4 h-4 mr-1.5" />;
                text = "Operational";
                break;
            case 'initializing':
                classes += " bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300";
                icon = <LoaderIcon className="w-4 h-4 mr-1.5 animate-spin" />;
                text = "Synchronizing";
                break;
            case 'error':
                classes += " bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
                icon = <ServerIcon className="w-4 h-4 mr-1.5" />;
                text = "Disconnected";
                break;
            default:
                return null;
        }

        return <div className={classes}>{icon}{text}</div>;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[Inter]">
            <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border-t-4 border-indigo-500">
                
                <header className="flex items-center justify-between mb-6 pb-4 border-b dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <ServerIcon className="w-6 h-6 mr-3 text-indigo-500" />
                        Backend Service Health Check
                    </h1>
                    <StatusBadge />
                </header>

                <div className="space-y-6">
                    {/* Status Message */}
                    <div className={`p-4 rounded-lg text-sm font-medium ${
                        status === 'connected' ? 'bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                        status === 'error' ? 'bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200' :
                        'bg-yellow-50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                    }`}>
                        {message}
                    </div>

                    {/* Configuration Details */}
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                        Configuration Details (from `server/db.js`)
                    </h2>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                        {Object.entries(DB_CONFIG).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0 last:pb-0">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Security Disclaimer */}
                    <div className="text-xs text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                        <p className="font-bold mb-1">Security Warning:</p>
                        <p>Direct database credentials (like the `root` user and password) must be stored ONLY on the server side (backend) and never exposed in the React application (frontend) for production use.</p>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DatabaseConnectionStatus;