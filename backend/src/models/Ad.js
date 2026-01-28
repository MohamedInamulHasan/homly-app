import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Please add an image']
    },
    link: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Ad', adSchema);
