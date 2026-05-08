import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    location: {
        type: String, // User's address text
        default: ''
    },
    coordinates: {
        type: String, // GPS "lat,long"
        default: ''
    },
    items: [{
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    requestDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;
