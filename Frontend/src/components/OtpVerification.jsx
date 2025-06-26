import React, { useState } from 'react';
import { useTickets } from '../contexts/TicketContext';

const OtpVerification = ({ maskedMobile, onVerify, onBack, onClose }) => {
    const [otp, setOtp] = useState('');
    const [formError, setFormError] = useState('');

    const { loading, error, demoOtp, isDemo } = useTickets();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!otp.trim()) {
            setFormError('Please enter the OTP');
            return;
        }

        try {
            await onVerify(otp);
        } catch (err) {
            setFormError(err.message || 'OTP verification failed');
        }
    };

    return (
        <>
            <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">OTP Verification</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {(formError || error) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{formError || error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6">
                <p className="text-gray-700 mb-4">
                    A verification code has been sent to your registered mobile number {maskedMobile}.
                </p>

                {isDemo && demoOtp && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Demo Mode:</strong> Your OTP is <span className="font-bold text-lg">{demoOtp}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                            Enter OTP
                        </label>
                        <input
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                            required
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default OtpVerification;