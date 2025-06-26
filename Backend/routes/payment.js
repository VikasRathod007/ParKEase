const express = require('express');
const { body } = require('express-validator');
const Ticket = require('../models/Ticket');
const { handleValidationErrors, asyncHandler } = require('../middleware/errorHandler');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Use environment variables for parking rates
const BASE_PARKING_RATE = process.env.BASE_PARKING_RATE || 5;
const ADDITIONAL_HOUR_RATE = process.env.ADDITIONAL_HOUR_RATE || 3;

// Helper function to calculate parking fee
// Helper function to calculate parking fee (using method from Ticket model)
const calculateParkingFee = (ticket) => {
    const feeInfo = ticket.calculateParkingFee();
    return feeInfo.totalFee;
};

// @desc    Calculate fee for a ticket
// @route   GET /api/payment/calculate/:ticketId
// @access  Public
router.get('/calculate/:ticketId', [
    body('ticketId').isMongoId().withMessage('Invalid ticket ID format')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }

    if (ticket.payment && ticket.payment.status === 'completed') {
        return res.status(400).json({
            success: false,
            message: 'This ticket has already been paid'
        });
    }

    const feeInfo = ticket.calculateParkingFee();

    return res.status(200).json({
        success: true,
        data: {
            ticketId: ticket.ticketId,
            vehicleNo: ticket.vehicleNo,
            inDateTime: ticket.inDateTime,
            currentTime: new Date(),
            hoursParked: feeInfo.hoursParked,
            parkingFee: feeInfo.totalFee,
            baseRate: feeInfo.baseRate,
            additionalHourRate: feeInfo.additionalHourRate,
            currency: 'USD'
        }
    });
}));

// @desc    Process payment for a ticket
// @route   POST /api/payment/process
// @access  Public (but could be protected)
router.post('/process', [
    body('ticketId').isMongoId().withMessage('Invalid ticket ID format'),
    body('paymentMethod').isString().withMessage('Payment method is required'),
    body('paymentAmount').isNumeric().withMessage('Payment amount must be a number')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { ticketId, paymentMethod, paymentAmount, paymentReference } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }

    if (ticket.payment && ticket.payment.status === 'completed') {
        return res.status(400).json({
            success: false,
            message: 'This ticket has already been paid'
        });
    }

    // In a real implementation, you would integrate with a payment processor like Stripe here

    // Update ticket with payment information
    ticket.payment = {
        status: 'completed',
        amount: paymentAmount,
        transactionId: paymentReference || `PAY-${Date.now()}`,
        paymentMethod: paymentMethod,
        processedAt: new Date()
    };

    // Save the updated ticket with payment info
    await ticket.save();

    // Return the updated ticket
    return res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
            ticketId: ticket.ticketId,
            vehicleNo: ticket.vehicleNo,
            inDateTime: ticket.inDateTime,
            outDateTime: ticket.outDateTime || null,
            paymentStatus: ticket.payment.status,
            paymentAmount: ticket.payment.amount,
            paymentReference: ticket.payment.transactionId,
            paymentTime: ticket.payment.processedAt
        }
    });
}));

// @desc    Get payment receipt
// @route   GET /api/payment/receipt/:ticketId
// @access  Public
router.get('/receipt/:ticketId', asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }

    if (!ticket.payment || ticket.payment.status !== 'completed') {
        return res.status(400).json({
            success: false,
            message: 'No payment found for this ticket'
        });
    }

    // Generate receipt data
    const receiptData = {
        receiptNo: `RCP-${ticket.ticketId.slice(-6)}-${Date.now().toString().slice(-4)}`,
        ticketId: ticket.ticketId,
        vehicleNo: ticket.vehicleNo,
        inDateTime: ticket.inDateTime,
        outDateTime: ticket.outDateTime || null,
        paymentStatus: ticket.payment.status,
        paymentAmount: ticket.payment.amount,
        paymentMethod: ticket.payment.paymentMethod,
        paymentReference: ticket.payment.transactionId,
        paymentTime: ticket.payment.processedAt,
        issueTime: new Date(),
        parkingLocation: ticket.parkingLocation
    };

    return res.status(200).json({
        success: true,
        data: receiptData
    });
}));

// @desc    Verify payment status
// @route   GET /api/payment/status/:ticketId
// @access  Public
router.get('/status/:ticketId', asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            ticketId: ticket.ticketId,
            vehicleNo: ticket.vehicleNo,
            paymentStatus: ticket.payment ? ticket.payment.status : 'pending',
            paymentAmount: ticket.payment ? ticket.payment.amount : null,
            paymentTime: ticket.payment ? ticket.payment.processedAt : null
        }
    });
}));

module.exports = router;
