import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a news title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please add news content']
    },
    image: {
        type: String,
        required: [true, 'Please add a news image']
    },
    images: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        enum: ['Agriculture', 'Market', 'Technology', 'Health', 'General', 'Offer', 'News', 'Deal'],
        default: 'General'
    },
    author: {
        type: String,
        default: 'Admin'
    },
    featured: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const News = mongoose.model('News', newsSchema);

export default News;
