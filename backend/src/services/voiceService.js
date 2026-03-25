import axios from 'axios';

/**
 * Sends a high-priority alert via ntfy.sh
 * @param {string} type - 'order' or 'service'
 * @param {Object} data - The order or service request data
 * @returns {Promise<boolean>} - True if successful
 */
export const sendVoiceAlert = async (type, data) => {
    try {
        const topic = process.env.NTFY_TOPIC;

        if (!topic) {
            console.warn('⚠️ Voice alert skipped: NTFY_TOPIC not configured in .env');
            return false;
        }

        const id = data._id.toString().slice(-8).toUpperCase();
        const amount = data.total ? `₹${data.total.toFixed(0)}` : '';
        
        const title = type === 'order' ? 'NEW ORDER RECEIVED' : 'NEW SERVICE REQUEST';

        const message = type === 'order' 
            ? `Order #${id} for ${amount} has arrived!`
            : `Service Request #${id} has arrived!`;

        // POST to ntfy.sh with priority headers
        const url = `https://ntfy.sh/${topic}`;

        console.log(`📞 Sending ntfy alert for ${type} #${id}...`);

        await axios.post(url, message, {
            headers: {
                'Title': title,
                'Priority': '5', // Max priority (makes loud sound)
                'Tags': type === 'order' ? 'shopping_bags,moneybag' : 'wrench,warning'
            }
        });

        console.log('✅ ntfy alert triggered successfully.');
        return true;
    } catch (error) {
        console.error('❌ Failed to trigger ntfy alert:', error.response?.data || error.message);
        return false;
    }
};

/**
 * Specific wrapper for orders
 */
export const sendOrderVoiceAlert = (order) => sendVoiceAlert('order', order);

/**
 * Specific wrapper for service requests
 */
export const sendServiceRequestVoiceAlert = (request) => sendVoiceAlert('service', request);
