import React, { useState } from 'react';
import { useTickets } from '../contexts/TicketContext';
import OtpVerification from './OtpVerification';
import PaymentGateway from './PaymentGateway';
import SuccessScreen from './SuccessScreen';

// Step indicators for the dispatch process
const STEPS = {
    VEHICLE_SEARCH: 0,
    OTP_VERIFICATION: 1,
    PAYMENT: 2,
    SUCCESS: 3
};

const DispatchTicketModal = ({ isOpen, onClose }) => {
    const [vehicleNo, setVehicleNo] = useState('');
    const [step, setStep] = useState(STEPS.VEHICLE_SEARCH);
    const [ticketDetails, setTicketDetails] = useState(null);
    const [maskedMobile, setMaskedMobile] = useState('');
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [formError, setFormError] = useState('');

    const {
        findTicketByVehicleNo,
        requestOTP,
        verifyOTP,
        processPayment,
        calculateParkingFee,
        loading,
        error,
        setError
    } = useTickets();

    if (!isOpen) return null;

    const handleVehicleSearch = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!vehicleNo.trim()) {
            setFormError('Please enter a vehicle number');
            return;
        }

        try {
            const ticket = findTicketByVehicleNo(vehicleNo);

            if (!ticket) {
                setFormError(`No active ticket found for vehicle ${vehicleNo}`);
                return;
            }

            // Get fee calculation
            const { hoursParked, totalFee } = calculateParkingFee(ticket.inDateTime);

            // Set ticket details with fee information
            setTicketDetails({
                ...ticket,
                hoursParked,
                totalFee
            });

            // Request OTP to be sent to the registered mobile
            const { maskedMobile } = await requestOTP(vehicleNo);
            setMaskedMobile(maskedMobile);

            // Move to OTP verification step
            setStep(STEPS.OTP_VERIFICATION);
        } catch (err) {
            setFormError(err.message || 'Failed to find ticket');
        }
    };

    const handleOtpVerification = async (otp) => {
        try {
            const isVerified = verifyOTP(vehicleNo, otp);

            if (isVerified) {
                // Move to payment step
                setStep(STEPS.PAYMENT);
            }
        } catch (err) {
            setFormError(err.message || 'OTP verification failed');
        }
    };

    const handlePaymentComplete = async () => {
        try {
            const paymentResult = await processPayment(vehicleNo);
            setPaymentDetails(paymentResult);
            setStep(STEPS.SUCCESS);
        } catch (err) {
            setFormError(err.message || 'Payment processing failed');
        }
    };

    const handleClose = () => {
        // Reset state
        setVehicleNo('');
        setStep(STEPS.VEHICLE_SEARCH);
        setTicketDetails(null);
        setMaskedMobile('');
        setPaymentDetails(null);
        setFormError('');
        setError(null);
        onClose();
    };

    const renderStep = () => {
        switch (step) {
            case STEPS.VEHICLE_SEARCH:
                return (
                    <>
                        <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Dispatch Parking Ticket
                            </h2>
                            <button
                                onClick={handleClose}
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

                        <form onSubmit={handleVehicleSearch} className="p-6">
                            <div className="mb-6">
                                <label htmlFor="vehicleNo" className="block text-sm font-medium text-gray-700 mb-1">
                                    Vehicle Number
                                </label>
                                <input
                                    id="vehicleNo"
                                    type="text"
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value)}
                                    placeholder="Enter vehicle number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Searching...' : 'Find Ticket'}
                            </button>
                        </form>
                    </>
                );

            case STEPS.OTP_VERIFICATION:
                return (
                    <OtpVerification
                        maskedMobile={maskedMobile}
                        onVerify={handleOtpVerification}
                        onBack={() => setStep(STEPS.VEHICLE_SEARCH)}
                        onClose={handleClose}
                    />
                );

            case STEPS.PAYMENT:
                return (
                    <PaymentGateway
                        ticketDetails={ticketDetails}
                        onPaymentComplete={handlePaymentComplete}
                        onBack={() => setStep(STEPS.OTP_VERIFICATION)}
                        onClose={handleClose}
                    />
                );

            case STEPS.SUCCESS:
                return (
                    <SuccessScreen
                        paymentDetails={paymentDetails}
                        onClose={handleClose}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {renderStep()}
            </div>
        </div>
    );
};

export default DispatchTicketModal;