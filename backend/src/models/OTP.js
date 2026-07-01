import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    emailOrMobile: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Document expires at this exact date
    }
}, { timestamps: true });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
