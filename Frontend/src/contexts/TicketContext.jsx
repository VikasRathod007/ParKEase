import React, { createContext, useState, useContext } from 'react';
import { ticketService, otpService } from '../utils/api';

export const TicketContext = createContext();

export const useTickets = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
    const [tickets, setTickets] = useState(() => {
        const savedTickets = localStorage.getItem('parkingTickets');
        return savedTickets ? JSON.parse(savedTickets) : [];
    });
    const [currentOtp, setCurrentOtp] = useState(null);
    const [demoOtp, setDemoOtp] = useState(null);
    const [isDemo, setIsDemo] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveTickets = (updatedTickets) => {
        localStorage.setItem('parkingTickets', JSON.stringify(updatedTickets));
        setTickets(updatedTickets);
    };

    const createTicket = async (customerName, vehicleNo, mobileNo) => {
        try {
            setLoading(true);
            setError(null);

            // Call backend API to create ticket
            const response = await ticketService.createTicket({
                customerName,
                vehicleNo,
                mobileNo,
                parkingLocation: 'Main Parking Area'
            });

            if (response.data.success) {
                const newTicket = response.data.data;

                // Add ticket to local state
                const updatedTickets = [...tickets, newTicket];
                saveTickets(updatedTickets);

                setLoading(false);
                return newTicket;
            } else {
                throw new Error(response.data.message || 'Failed to create ticket');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create ticket';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    // Find ticket by vehicle number
    const findTicketByVehicleNo = (vehicleNo) => {
        return tickets.find(
            ticket => ticket.vehicleNo.toUpperCase() === vehicleNo.toUpperCase() &&
                ticket.status === 'active'
        );
    };

    // Request OTP for dispatch using backend API
    const requestOTP = async (vehicleNo) => {
        try {
            setLoading(true);
            setError(null);

            const response = await otpService.requestOtp(vehicleNo);

            if (response.data.success) {
                // Store demo OTP if provided
                if (response.data.data.isDemo && response.data.data.demoOtp) {
                    setDemoOtp(response.data.data.demoOtp);
                    setIsDemo(true);
                } else {
                    setDemoOtp(null);
                    setIsDemo(false);
                }
                setCurrentOtp(null);
                setLoading(false);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to request OTP');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to request OTP';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    // Verify OTP using backend API
    const verifyOTP = async (vehicleNo, otp) => {
        try {
            setLoading(true);
            setError(null);

            const response = await otpService.verifyOtp(vehicleNo, otp);

            if (response.data.success) {
                setOtpVerified(true);
                setCurrentOtp(null);
                setLoading(false);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Invalid OTP');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'OTP verification failed';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    // Calculate parking fee
    const calculateParkingFee = (inDateTime) => {
        const entryTime = new Date(inDateTime);
        const exitTime = new Date();

        // Calculate hours parked (rounded up to nearest hour)
        const hoursParked = Math.ceil(
            (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60)
        );

        // Base rate: $5 for first hour, $3 for each additional hour
        const baseRate = 5;
        const additionalHourRate = 3;

        let totalFee = baseRate;
        if (hoursParked > 1) {
            totalFee += (hoursParked - 1) * additionalHourRate;
        }

        return {
            hoursParked,
            totalFee
        };
    };

    // Process payment for a ticket
    const processPayment = async (vehicleNo) => {
        try {
            setLoading(true);
            setError(null);

            // Find the ticket
            const ticket = findTicketByVehicleNo(vehicleNo);

            if (!ticket) {
                throw new Error('No active ticket found for this vehicle');
            }

            if (!otpVerified) {
                throw new Error('OTP verification required before payment');
            }

            // Calculate parking fee
            const { totalFee } = calculateParkingFee(ticket.inDateTime);

            // In a real app, you'd integrate with a payment gateway here
            // For demo purposes, we'll simulate a successful payment
            const transactionId = `TXN-${Date.now()}`;
            const outDateTime = new Date().toISOString();

            // Update the ticket with payment and exit information
            const updatedTickets = tickets.map(t => {
                if (t.id === ticket.id) {
                    return {
                        ...t,
                        outDateTime,
                        status: 'completed',
                        payment: {
                            status: 'completed',
                            amount: totalFee,
                            transactionId
                        }
                    };
                }
                return t;
            });

            // Save updated tickets
            saveTickets(updatedTickets);

            // In a real app, you'd send an SMS confirmation here
            console.log(`Sending payment confirmation SMS to ${ticket.mobileNo}`);

            setOtpVerified(false);
            setLoading(false);

            return {
                ticketId: ticket.id,
                customerName: ticket.customerName,
                vehicleNo: ticket.vehicleNo,
                inDateTime: ticket.inDateTime,
                outDateTime,
                totalFee,
                transactionId
            };
        } catch (err) {
            setError('Payment failed: ' + err.message);
            setLoading(false);
            throw err;
        }
    };

    const value = {
        tickets,
        loading,
        error,
        createTicket,
        findTicketByVehicleNo,
        requestOTP,
        verifyOTP,
        processPayment,
        calculateParkingFee,
        otpVerified,
        currentOtp,
        demoOtp,
        isDemo,
        setError
    };

    return (
        <TicketContext.Provider value={value}>
            {children}
        </TicketContext.Provider>
    );
};