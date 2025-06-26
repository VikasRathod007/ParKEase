import React from 'react';

const SuccessScreen = ({ paymentDetails, onClose }) => {
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

    return (
        <>
            <div className="flex justify-between items-center p-6 bg-green-500 text-white">
                <h2 className="text-xl font-semibold">Payment Successful!</h2>
                <button
                    onClick={onClose}
                    className="text-white hover:text-green-100"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-6">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-3 rounded-full">
                        <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                    <p className="text-gray-600">
                        Your payment has been processed successfully. A confirmation has been sent to your mobile.
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Receipt Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Transaction ID:</div>
                        <div className="font-medium">{paymentDetails.transactionId}</div>

                        <div className="text-gray-600">Customer Name:</div>
                        <div className="font-medium">{paymentDetails.customerName}</div>

                        <div className="text-gray-600">Vehicle Number:</div>
                        <div className="font-medium">{paymentDetails.vehicleNo}</div>

                        <div className="text-gray-600">Entry Time:</div>
                        <div className="font-medium">{formatDateTime(paymentDetails.inDateTime)}</div>

                        <div className="text-gray-600">Exit Time:</div>
                        <div className="font-medium">{formatDateTime(paymentDetails.outDateTime)}</div>

                        <div className="text-gray-600 font-semibold">Amount Paid:</div>
                        <div className="font-bold text-green-700">${paymentDetails.totalFee.toFixed(2)}</div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Close
                </button>
            </div>
        </>
    );
};

export default SuccessScreen;