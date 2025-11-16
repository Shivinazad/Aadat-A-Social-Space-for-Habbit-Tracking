import React, { useState } from 'react';

// --- Icons using lucide-react ---
const SendIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20l-4-9l9-4l-7-2l-2-7L22 2z"/></svg>;
const UserIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7l-10 7L2 7"/></svg>;
const CheckCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.66"/><path d="M9 11l3 3L22 4"/></svg>;
const AlertCircleIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>;


/**
 * InviteFriendForm Component
 * Provides a UI for users to input an email and send an invitation,
 * simulating a call to the backend email service.
 */
const InviteFriendForm = () => {
    // Current user's name (mocked for demo)
    const currentUserName = "Sarah J."; 
    
    const [recipientEmail, setRecipientEmail] = useState('');
    const [status, setStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');
    
    // Simple email validation
    const isValidEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        if (!isValidEmail(recipientEmail)) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        // --- Simulated API Call ---
        // In a real application, this is where you would call your backend endpoint:
        // const response = await fetch('/api/users/invite', { 
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ toEmail: recipientEmail, senderName: currentUserName })
        // });

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency & server processing

            // Simulate success 90% of the time, failure 10%
            if (Math.random() < 0.9) {
                setStatus('success');
                setMessage(`Invitation sent successfully to ${recipientEmail}!`);
                setRecipientEmail(''); // Clear input on success
            } else {
                throw new Error("SMTP service timed out.");
            }
        } catch (err) {
            setStatus('error');
            setMessage(`Failed to send invitation. Please try again. (${err.message})`);
        }
    };

    const getStatusUI = () => {
        if (!status || status === 'idle') return null;

        const baseClasses = "flex items-center p-3 rounded-lg font-medium mb-6";
        
        switch (status) {
            case 'loading':
                return (
                    <div className={`${baseClasses} bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300`}>
                        <SendIcon className="w-5 h-5 animate-pulse mr-3" />
                        Sending invitation...
                    </div>
                );
            case 'success':
                return (
                    <div className={`${baseClasses} bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300`}>
                        <CheckCircleIcon className="w-5 h-5 mr-3" />
                        {message}
                    </div>
                );
            case 'error':
                return (
                    <div className={`${baseClasses} bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300`}>
                        <AlertCircleIcon className="w-5 h-5 mr-3" />
                        {message}
                    </div>
                );
            default:
                return null;
        }
    };

    const isButtonDisabled = status === 'loading' || !recipientEmail;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[Inter]">
            <div className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
                
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Invite a Habit Buddy
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Ask a friend to join Aadat and build streaks together!
                    </p>
                </header>

                {getStatusUI()}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sender Name (Read-only/Hidden) */}
                    <div className="relative">
                        <label 
                            htmlFor="sender-name" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Your Name
                        </label>
                        <div className="mt-1 flex rounded-lg shadow-sm">
                            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400 sm:text-sm">
                                <UserIcon className="w-5 h-5" />
                            </span>
                            <input
                                id="sender-name"
                                type="text"
                                value={currentUserName}
                                readOnly
                                className="flex-1 block w-full rounded-r-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 cursor-default"
                                aria-describedby="sender-description"
                            />
                        </div>
                        <p id="sender-description" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Your name will appear in the invitation email.
                        </p>
                    </div>

                    {/* Recipient Email Input */}
                    <div className="relative">
                        <label 
                            htmlFor="recipient-email" 
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Friend's Email Address
                        </label>
                        <div className="mt-1 flex rounded-lg shadow-sm">
                            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400 sm:text-sm">
                                <MailIcon className="w-5 h-5" />
                            </span>
                            <input
                                id="recipient-email"
                                type="email"
                                placeholder="name@example.com"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                required
                                className="flex-1 block w-full rounded-r-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white transition duration-300 transform active:scale-[0.98] ${
                            isButtonDisabled
                                ? 'bg-indigo-400 cursor-not-allowed opacity-70'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                    >
                        <SendIcon className="w-5 h-5 mr-3" />
                        {status === 'loading' ? 'Sending...' : 'Send Invitation'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default InviteFriendForm;