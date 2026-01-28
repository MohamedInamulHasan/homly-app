import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow guest checkout
    },
    items: [{

        product: {
            type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and numeric IDs (for mock data)
            // ref: 'Product' // populate will only work for valid ObjectIds
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        image: String,
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: false
        }
    }],
    shippingAddress: {
        name: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: String,
        zip: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'India'
        },
        mobile: {
            type: String,
            required: true
        }
    },
    paymentMethod: {
        type: {
            type: String,
            default: 'Cash on Delivery'
        },
        last4: String
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    shipping: {
        type: Number,
        required: true,
        default: 20
    },
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    scheduledDeliveryTime: {
        type: Date,
        required: false
    },
    deliveredAt: Date
}, {
    timestamps: true
});

// Index for fetching user orders efficiently (sorted by date)
orderSchema.index({ user: 1, createdAt: -1 });
// Index for admin dashboard to fetch latest orders efficiently
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
