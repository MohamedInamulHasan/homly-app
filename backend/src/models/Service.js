import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a service name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    image: {
        type: String, // Base64 image
        required: [true, 'Please add an image']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
