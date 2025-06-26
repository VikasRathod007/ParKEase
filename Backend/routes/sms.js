const express = require('express');
const { getTwilioStatus } = require('../utils/sms');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Get Twilio service status
router.get('/status', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const status = getTwilioStatus();
    res.status(200).json({
        success: true,
        data: status
    });
}));

module.exports = router;
