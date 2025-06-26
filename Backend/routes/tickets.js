const express = require('express');
const { body, param } = require('express-validator');
const Ticket = require('../models/Ticket');
const { generateOTP } = require('../utils/sms');
const { handleValidationErrors, asyncHandler } = require('../middleware/errorHandler');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create parking ticket
router.post('/', [
    body('customerName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Customer name must be between 2 and 100 characters'),
    body('vehicleNo')
        .trim()
        .isLength({ min: 2, max: 20 })
        .matches(/^[A-Z0-9\s-]+$/i)
        .withMessage('Please provide a valid vehicle number'),
    body('mobileNo')
        .matches(/^\+?[\d\s-()]+$/)
        .withMessage('Please provide a valid mobile number'),
    body('parkingLocation')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Parking location cannot exceed 100 characters')
], handleValidationErrors, optionalAuth, asyncHandler(async (req, res) => {
    const { customerName, vehicleNo, mobileNo, parkingLocation } = req.body;

    // Check if there's already an active ticket for this vehicle
    const existingTicket = await Ticket.findActiveByVehicleNo(vehicleNo);

    if (existingTicket) {
        return res.status(400).json({
            success: false,
            message: 'Vehicle already has an active parking ticket',
            data: {
                existingTicketId: existingTicket.ticketId,
                inDateTime: existingTicket.inDateTime
            }
        });
    }

    // Generate OTP
    const otp = generateOTP();

    // Create ticket
    const ticket = await Ticket.create({
        customerName,
        vehicleNo: vehicleNo.toUpperCase(),
        mobileNo,
        otp,
        parkingLocation: parkingLocation || 'Main Parking Area',
        createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({
        success: true,
        message: 'Parking ticket created successfully. OTP sent to mobile number.',
        data: {
            ticketId: ticket.ticketId,
            customerName: ticket.customerName,
            vehicleNo: ticket.vehicleNo,
            mobileNo: ticket.mobileNo,
            inDateTime: ticket.inDateTime,
            status: ticket.status,
            parkingLocation: ticket.parkingLocation,
            // Don't send OTP in response for security
            otpSent: true
        }
    });
}));

// @desc    Get ticket by vehicle number
// @route   GET /api/tickets/vehicle/:vehicleNo
// @access  Public
router.get('/vehicle/:vehicleNo', [
    param('vehicleNo')
        .trim()
        .isLength({ min: 2, max: 20 })
        .matches(/^[A-Z0-9\s-]+$/i)
        .withMessage('Please provide a valid vehicle number')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { vehicleNo } = req.params;

    const ticket = await Ticket.findActiveByVehicleNo(vehicleNo);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'No active ticket found for this vehicle'
        });
    }

    const feeCalculation = ticket.calculateParkingFee();

    res.status(200).json({
        success: true,
        data: {
            ticketId: ticket.ticketId,
            customerName: ticket.customerName,
            vehicleNo: ticket.vehicleNo,
            mobileNo: ticket.mobileNo,
            inDateTime: ticket.inDateTime,
            status: ticket.status,
            parkingLocation: ticket.parkingLocation,
            parkingDuration: feeCalculation.hoursParked,
            estimatedFee: feeCalculation.totalFee,
            payment: ticket.payment
        }
    });
}));

// @desc    Get ticket by ticket ID
// @route   GET /api/tickets/:ticketId
// @access  Public
router.get('/:ticketId', [
    param('ticketId')
        .trim()
        .notEmpty()
        .withMessage('Ticket ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }

    const feeCalculation = ticket.calculateParkingFee();

    res.status(200).json({
        success: true,
        data: {
            ticketId: ticket.ticketId,
            customerName: ticket.customerName,
            vehicleNo: ticket.vehicleNo,
            mobileNo: ticket.mobileNo,
            inDateTime: ticket.inDateTime,
            outDateTime: ticket.outDateTime,
            status: ticket.status,
            parkingLocation: ticket.parkingLocation,
            parkingDuration: feeCalculation.hoursParked,
            totalFee: ticket.status === 'completed' ? ticket.payment.amount : feeCalculation.totalFee,
            payment: ticket.payment
        }
    });
}));

// @desc    Get tickets by mobile number
// @route   GET /api/tickets/mobile/:mobileNo
// @access  Public
router.get('/mobile/:mobileNo', [
    param('mobileNo')
        .matches(/^\+?[\d\s-()]+$/)
        .withMessage('Please provide a valid mobile number')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { mobileNo } = req.params;

    const tickets = await Ticket.findByMobileNo(mobileNo).limit(10);

    const ticketsWithFees = tickets.map(ticket => {
        const feeCalculation = ticket.calculateParkingFee();
        return {
            ticketId: ticket.ticketId,
            customerName: ticket.customerName,
            vehicleNo: ticket.vehicleNo,
            inDateTime: ticket.inDateTime,
            outDateTime: ticket.outDateTime,
            status: ticket.status,
            parkingLocation: ticket.parkingLocation,
            parkingDuration: feeCalculation.hoursParked,
            totalFee: ticket.status === 'completed' ? ticket.payment.amount : feeCalculation.totalFee,
            payment: ticket.payment
        };
    });

    res.status(200).json({
        success: true,
        data: ticketsWithFees,
        count: tickets.length
    });
}));

// @desc    Update ticket status
// @route   PATCH /api/tickets/:ticketId/status
// @access  Private (Admin/Operator only)
router.patch('/:ticketId/status', protect, [
    param('ticketId')
        .trim()
        .notEmpty()
        .withMessage('Ticket ID is required'),
    body('status')
        .isIn(['active', 'completed', 'cancelled'])
        .withMessage('Status must be active, completed, or cancelled')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }

    ticket.status = status;

    if (status === 'completed' && !ticket.outDateTime) {
        ticket.outDateTime = new Date();
    }

    await ticket.save();

    res.status(200).json({
        success: true,
        message: 'Ticket status updated successfully',
        data: {
            ticketId: ticket.ticketId,
            status: ticket.status,
            outDateTime: ticket.outDateTime
        }
    });
}));

// @desc    Dispatch ticket (complete the parking)
// @route   POST /api/tickets/:ticketId/dispatch
// @access  Public
router.post('/:ticketId/dispatch', [
    param('ticketId')
        .trim()
        .notEmpty()
        .withMessage('Ticket ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { ticketId } = req.params;

    // Find ticket by ticketId (not MongoDB _id)
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: 'Ticket not found'
        });
    }

    if (ticket.status !== 'active') {
        return res.status(400).json({
            success: false,
            message: 'Ticket is not active'
        });
    }

    // Check if OTP has been verified
    if (!ticket.otpVerified) {
        return res.status(400).json({
            success: false,
            message: 'OTP must be verified before dispatching ticket'
        });
    }

    // Set out time and complete the ticket
    ticket.outDateTime = new Date();
    ticket.status = 'completed';

    await ticket.save();

    // Calculate final fee
    const feeCalculation = ticket.calculateParkingFee();

    res.status(200).json({
        success: true,
        message: 'Ticket dispatched successfully',
        data: {
            ticketId: ticket.ticketId,
            customerName: ticket.customerName,
            vehicleNo: ticket.vehicleNo,
            inDateTime: ticket.inDateTime,
            outDateTime: ticket.outDateTime,
            status: ticket.status,
            parkingDuration: feeCalculation.hoursParked,
            totalFee: feeCalculation.totalFee,
            payment: ticket.payment
        }
    });
}));

// @desc    Get all tickets (Admin only)
// @route   GET /api/tickets
// @access  Private (Admin only)
router.get('/', protect, asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, vehicleNo, fromDate, toDate } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (vehicleNo) query.vehicleNo = vehicleNo.toUpperCase();
    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Execute query with pagination
    const tickets = await Ticket.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('createdBy', 'name email');

    const total = await Ticket.countDocuments(query);

    const ticketsWithFees = tickets.map(ticket => {
        const feeCalculation = ticket.calculateParkingFee();
        return {
            ticketId: ticket.ticketId,
            customerName: ticket.customerName,
            vehicleNo: ticket.vehicleNo,
            mobileNo: ticket.mobileNo,
            inDateTime: ticket.inDateTime,
            outDateTime: ticket.outDateTime,
            status: ticket.status,
            parkingLocation: ticket.parkingLocation,
            parkingDuration: feeCalculation.hoursParked,
            totalFee: ticket.status === 'completed' ? ticket.payment.amount : feeCalculation.totalFee,
            payment: ticket.payment,
            createdBy: ticket.createdBy,
            createdAt: ticket.createdAt
        };
    });

    res.status(200).json({
        success: true,
        data: ticketsWithFees,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
        }
    });
}));

module.exports = router;
