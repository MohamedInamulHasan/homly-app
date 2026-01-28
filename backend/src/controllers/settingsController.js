import Settings from '../models/Settings.js';

// Get all settings or a specific setting by key
export const getSettings = async (req, res) => {
    try {
        const { key } = req.params;

        if (key) {
            const setting = await Settings.findOne({ key });
            if (!setting) {
                // If requesting a specific key that doesn't exist, return default structure or 404
                // For delivery_times, if it doesn't exist, we might want to return a default
                if (key === 'delivery_times') {
                    return res.json({ success: true, data: { value: [] } }); // Return empty array implies no restriction or need to handle on frontend
                }
                return res.status(404).json({ success: false, message: 'Setting not found' });
            }
            return res.json({ success: true, data: setting });
        }

        const settings = await Settings.find({});
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching settings' });
    }
};

// Update or create a setting
export const updateSettings = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        if (!key || value === undefined) {
            return res.status(400).json({ success: false, message: 'Key and value are required' });
        }

        const setting = await Settings.findOneAndUpdate(
            { key },
            {
                value,
                description,
                updatedAt: Date.now()
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, data: setting });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Server error updating settings' });
    }
};
