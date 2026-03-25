import mongoose from 'mongoose';

const serviceItemSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    image: {
        type: String, // URL/Base64
        required: [true, 'Please add an image']
    },
    name: {
        type: String,
        required: [true, 'Please add a service item name'],
        trim: true
    },
    description: {
        type: String,
        required: false // Made optional
    },
    price: {
        type: Number,
        required: false, // Made optional
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isAvailable: {
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

const ServiceItem = mongoose.model('ServiceItem', serviceItemSchema);

export default ServiceItem;
