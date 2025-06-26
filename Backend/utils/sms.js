const twilio = require('twilio');

let twilioClient = null;
let isRealSMSMode = false;

const shouldUseMockMode = process.env.TWILIO_MOCK_MODE === 'true' ||
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER ||
    process.env.TWILIO_ACCOUNT_SID === 'AC_YOUR_ACCOUNT_SID_HERE';

if (!shouldUseMockMode) {
    if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
        process.env.TWILIO_ACCOUNT_SID.length === 34) {
        try {
            twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            isRealSMSMode = true;
            console.log('✅ Twilio client initialized - Real SMS mode enabled');
        } catch (err) {
            console.log('❌ Twilio client failed to initialize:', err.message);
            console.log('📱 Falling back to mock SMS mode');
            twilioClient = null;
            isRealSMSMode = false;
        }
    } else {
        console.log('❌ Invalid Twilio Account SID format');
        console.log('📱 Using mock SMS mode');
        isRealSMSMode = false;
    }
} else {
    console.log('📱 Twilio mock mode enabled (set TWILIO_MOCK_MODE=false for real SMS)');
    isRealSMSMode = false;
}

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOTPViaSMS = async (mobileNo, otp, purpose = 'verification') => {
    const formattedNumber = formatMobileNumber(mobileNo);

    if (!isValidMobileNumber(formattedNumber)) {
        throw new Error('Invalid mobile number format');
    }

    let phoneNumber;
    if (formattedNumber.startsWith('+')) {
        phoneNumber = formattedNumber;
    } else if (formattedNumber.startsWith('91')) {
        phoneNumber = `+${formattedNumber}`;
    } else if (formattedNumber.length === 10) {
        phoneNumber = `+91${formattedNumber}`;
    } else {
        phoneNumber = `+${formattedNumber}`;
    }

    if (phoneNumber === process.env.TWILIO_PHONE_NUMBER) {
        return {
            success: true,
            message: `OTP sent to ${maskMobileNumber(phoneNumber)} (Mock mode)`,
            sid: `mock-${Date.now()}`,
            mockMode: true
        };
    }

    if (!isRealSMSMode) {
        console.log(`📱 Mock SMS: Sending OTP ${otp} to ${phoneNumber} for ${purpose}`);
        return {
            success: true,
            message: `OTP sent to ${maskMobileNumber(phoneNumber)} (Mock mode)`,
            sid: `mock-${Date.now()}`,
            mockMode: true
        };
    }

    try {
        console.log(`📤 Sending real SMS to ${maskMobileNumber(phoneNumber)}`);

        const message = await twilioClient.messages.create({
            body: `Your Pay Parking ${purpose} OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log(`✅ SMS sent successfully. SID: ${message.sid}`);

        return {
            success: true,
            message: `OTP sent to ${maskMobileNumber(phoneNumber)}`,
            sid: message.sid,
            mockMode: false
        };
    } catch (error) {
        console.error('❌ SMS sending error:', error);
        throw new Error('Failed to send OTP via SMS');
    }
};

const maskMobileNumber = (mobileNo) => {
    if (!mobileNo || mobileNo.length < 4) return mobileNo;

    const cleaned = mobileNo.replace(/\D/g, '');

    if (cleaned.length <= 4) return mobileNo;

    const start = cleaned.slice(0, 2);
    const end = cleaned.slice(-2);
    const middle = '*'.repeat(cleaned.length - 4);

    return `${start}${middle}${end}`;
};

const isValidMobileNumber = (mobileNo) => {
    const cleaned = mobileNo.replace(/\D/g, '');

    if (cleaned.length < 10 || cleaned.length > 15) {
        return false;
    }

    const mobileRegex = /^\+?[1-9]\d{1,14}$/;
    return mobileRegex.test(mobileNo.replace(/[\s-()]/g, ''));
};

const formatMobileNumber = (mobileNo) => {
    return mobileNo.replace(/[\s-()]/g, '').trim();
};

const getTwilioStatus = () => {
    return {
        isConfigured: !!twilioClient,
        isRealMode: isRealSMSMode,
        isMockMode: !isRealSMSMode,
        phoneNumber: isRealSMSMode ? process.env.TWILIO_PHONE_NUMBER : 'Mock number'
    };
};

module.exports = {
    generateOTP,
    sendOTPViaSMS,
    maskMobileNumber,
    isValidMobileNumber,
    formatMobileNumber,
    getTwilioStatus
};
