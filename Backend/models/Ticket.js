const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            return `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [100, 'Customer name cannot be more than 100 characters']
    },
    vehicleNo: {
        type: String,
        required: [true, 'Vehicle number is required'],
        uppercase: true,
        trim: true,
        match: [/^[A-Z0-9\s-]+$/, 'Please provide a valid vehicle number']
    },
    mobileNo: {
        type: String,
        required: [true, 'Mobile number is required'],
        match: [/^\+?[\d\s-()]+$/, 'Please provide a valid mobile number']
    },
    inDateTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    outDateTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    otp: {
        type: String,
        required: true
    },
    otpExpiry: {
        type: Date,
        required: true,
        default: function () {
            return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        }
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        amount: {
            type: Number,
            min: 0
        },
        transactionId: {
            type: String
        },
        paymentMethod: {
            type: String,
            enum: ['card', 'cash', 'digital_wallet', 'bank_transfer']
        },
        processedAt: {
            type: Date
        }
    },
    parkingLocation: {
        type: String,
        default: 'Main Parking Area'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
ticketSchema.index({ vehicleNo: 1, status: 1 });
// ticketId already has unique: true which creates an index
ticketSchema.index({ mobileNo: 1 });
ticketSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
ticketSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for parking duration in hours
ticketSchema.virtual('parkingDurationHours').get(function () {
    if (!this.outDateTime) {
        return Math.ceil((Date.now() - this.inDateTime.getTime()) / (1000 * 60 * 60));
    }
    return Math.ceil((this.outDateTime.getTime() - this.inDateTime.getTime()) / (1000 * 60 * 60));
});

// Method to calculate parking fee
ticketSchema.methods.calculateParkingFee = function () {
    const hoursParked = this.parkingDurationHours;
    const baseRate = parseInt(process.env.BASE_PARKING_RATE) || 5;
    const additionalHourRate = parseInt(process.env.ADDITIONAL_HOUR_RATE) || 3;

    let totalFee = baseRate;
    if (hoursParked > 1) {
        totalFee += (hoursParked - 1) * additionalHourRate;
    }

    return {
        hoursParked,
        totalFee,
        baseRate,
        additionalHourRate
    };
};

// Method to check if OTP is valid
ticketSchema.methods.isOtpValid = function (otp) {
    return this.otp === otp && this.otpExpiry > Date.now();
};

// Static method to find active ticket by vehicle number
ticketSchema.statics.findActiveByVehicleNo = function (vehicleNo) {
    return this.findOne({
        vehicleNo: vehicleNo.toUpperCase(),
        status: 'active'
    });
};

// Static method to find tickets by mobile number
ticketSchema.statics.findByMobileNo = function (mobileNo) {
    return this.find({ mobileNo }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Ticket', ticketSchema);
