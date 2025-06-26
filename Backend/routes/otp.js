const express = require('express');
const { body, param } = require('express-validator');
const Ticket = require('../models/Ticket');
const { generateOTP, sendOTPViaSMS, maskMobileNumber, getTwilioStatus } = require('../utils/sms');
const { handleValidationErrors, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Request OTP for ticket dispatch
router.post('/request', [
    body('vehicleNo')
        .trim()
        .isLength({ min: 2, max: 20 })
        .matches(/^[A-Z0-9\s-]+$/i)
        .withMessage('Please provide a valid vehicle number')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { vehicleNo } = req.body;

    const ticket = await Ticket.findActiveByVehicleNo(vehicleNo);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'No active ticket found for this vehicle'
        });
    }

    // Generate new OTP and update expiry
    const newOtp = generateOTP();
    ticket.otp = newOtp;
    ticket.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    ticket.otpVerified = false;

    await ticket.save();

    try {
        // Send OTP via SMS
        await sendOTPViaSMS(ticket.mobileNo, newOtp, 'dispatch');

        const twilioStatus = getTwilioStatus();
        const responseData = {
            ticketId: ticket.ticketId,
            mobileNo: maskMobileNumber(ticket.mobileNo),
            otpExpiry: ticket.otpExpiry
        };

        // Include OTP in response for demo mode
        if (twilioStatus.isMockMode) {
            responseData.demoOtp = newOtp;
            responseData.isDemo = true;
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: responseData
        });
    } catch (error) {
        console.error('Failed to send OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
}));

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Public
router.post('/verify', [
    body('vehicleNo')
        .trim()
        .isLength({ min: 2, max: 20 })
        .matches(/^[A-Z0-9\s-]+$/i)
        .withMessage('Please provide a valid vehicle number'),
    body('otp')
        .trim()
        .isLength({ min: 4, max: 6 })
        .isNumeric()
        .withMessage('OTP must be 4-6 digits')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { vehicleNo, otp } = req.body;

    // Find active ticket
    const ticket = await Ticket.findActiveByVehicleNo(vehicleNo);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'No active ticket found for this vehicle'
        });
    }

    // Check if OTP is valid
    if (!ticket.isOtpValid(otp)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired OTP'
        });
    }

    // Mark OTP as verified
    ticket.otpVerified = true;
    await ticket.save();

    // Calculate parking fee
    const feeCalculation = ticket.calculateParkingFee();

    res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: {
            ticketId: ticket.ticketId,
            customerName: ticket.customerName,
            vehicleNo: ticket.vehicleNo,
            inDateTime: ticket.inDateTime,
            parkingDuration: feeCalculation.hoursParked,
            totalFee: feeCalculation.totalFee,
            feeBreakdown: {
                baseRate: feeCalculation.baseRate,
                additionalHours: feeCalculation.hoursParked - 1,
                additionalHourRate: feeCalculation.additionalHourRate
            },
            otpVerified: true
        }
    });
}));

// @desc    Resend OTP
// @route   POST /api/otp/resend
// @access  Public
router.post('/resend', [
    body('vehicleNo')
        .trim()
        .isLength({ min: 2, max: 20 })
        .matches(/^[A-Z0-9\s-]+$/i)
        .withMessage('Please provide a valid vehicle number')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { vehicleNo } = req.body;

    // Find active ticket
    const ticket = await Ticket.findActiveByVehicleNo(vehicleNo);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'No active ticket found for this vehicle'
        });
    }

    // Check if enough time has passed since last OTP request (prevent spam)
    const timeSinceLastOtp = Date.now() - (ticket.otpExpiry.getTime() - 10 * 60 * 1000);
    const minWaitTime = 60 * 1000; // 1 minute

    if (timeSinceLastOtp < minWaitTime) {
        return res.status(429).json({
            success: false,
            message: 'Please wait before requesting another OTP',
            waitTime: Math.ceil((minWaitTime - timeSinceLastOtp) / 1000)
        });
    }

    // Generate new OTP and update expiry
    const newOtp = generateOTP();
    ticket.otp = newOtp;
    ticket.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    ticket.otpVerified = false;

    await ticket.save();

    try {
        // Send OTP via SMS
        await sendOTPViaSMS(ticket.mobileNo, newOtp, 'dispatch');

        res.status(200).json({
            success: true,
            message: 'New OTP sent successfully',
            data: {
                ticketId: ticket.ticketId,
                mobileNo: maskMobileNumber(ticket.mobileNo),
                otpExpiry: ticket.otpExpiry
            }
        });
    } catch (error) {
        console.error('Failed to resend OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
}));

// @desc    Check OTP status
// @route   GET /api/otp/status/:vehicleNo
// @access  Public
router.get('/status/:vehicleNo', [
    param('vehicleNo')
        .trim()
        .isLength({ min: 2, max: 20 })
        .matches(/^[A-Z0-9\s-]+$/i)
        .withMessage('Please provide a valid vehicle number')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { vehicleNo } = req.params;

    // Find active ticket
    const ticket = await Ticket.findActiveByVehicleNo(vehicleNo);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'No active ticket found for this vehicle'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            ticketId: ticket.ticketId,
            otpVerified: ticket.otpVerified,
            otpExpiry: ticket.otpExpiry,
            isOtpExpired: ticket.otpExpiry < new Date(),
            mobileNo: maskMobileNumber(ticket.mobileNo)
        }
    });
}));

module.exports = router;
