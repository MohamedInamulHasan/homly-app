import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    device: {
        type: String
    }
}, {
    timestamps: true
});

const LoginLog = mongoose.model('LoginLog', loginLogSchema);

export default LoginLog;
