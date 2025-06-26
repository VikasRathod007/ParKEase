import React, { useState } from 'react';
import { useTickets } from '../contexts/TicketContext';

const PaymentGateway = ({ ticketDetails, onPaymentComplete, onBack, onClose }) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [formError, setFormError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { loading, error } = useTickets();

    // Format the date for display
    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setIsProcessing(true);

        try {
            // In a real app, you'd process payment with a payment gateway
            // For demo, we'll simulate payment processing with a delay
            setTimeout(async () => {
                try {
                    await onPaymentComplete();
                } catch (error) {
                    setFormError(error.message || 'Payment failed');
                } finally {
                    setIsProcessing(false);
                }
            }, 2000);
        } catch (err) {
            setFormError(err.message || 'Payment processing failed');
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Payment</h2>
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
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Parking Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Customer Name:</div>
                        <div className="font-medium">{ticketDetails.customerName}</div>

                        <div className="text-gray-600">Vehicle Number:</div>
                        <div className="font-medium">{ticketDetails.vehicleNo}</div>

                        <div className="text-gray-600">Entry Time:</div>
                        <div className="font-medium">{formatDateTime(ticketDetails.inDateTime)}</div>

                        <div className="text-gray-600">Duration:</div>
                        <div className="font-medium">{ticketDetails.hoursParked} hour(s)</div>

                        <div className="text-gray-600 font-semibold">Total Amount:</div>
                        <div className="font-bold text-green-700">${ticketDetails.totalFee.toFixed(2)}</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Select Payment Method</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                    className="sr-only"
                                />
                                <svg className="w-8 h-8 mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span>Credit/Debit Card</span>
                            </label>

                            <label className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={() => setPaymentMethod('upi')}
                                    className="sr-only"
                                />
                                <svg className="w-8 h-8 mb-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>UPI / Mobile Payment</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isProcessing || loading}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing || loading}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            {isProcessing || loading ? 'Processing...' : `Pay $${ticketDetails.totalFee.toFixed(2)}`}
                        </button>
                    </div>
                </form>

                {/* For demo purposes only - delete in production */}
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <strong>Demo mode:</strong> No actual payment will be processed. Click the pay button to simulate payment.
                </div>
            </div>
        </>
    );
};

export default PaymentGateway;