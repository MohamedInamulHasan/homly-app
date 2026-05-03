import axios from 'axios';

/**
 * Sends a WhatsApp notification via CallMeBot Free API
 * @param {Object} order - The order object
 * @returns {Promise<boolean>} - True if successful
 */
export const sendOrderWhatsAppNotification = async (order) => {
    try {
        const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
        const apiKey = process.env.WHATSAPP_API_KEY;

        if (!phoneNumber || !apiKey) {
            console.warn('⚠️ WhatsApp notification skipped: Missing credentials in .env');
            return false;
        }

        const shippingAddr = order.shippingAddress || {};
        const customerName = shippingAddr.name || order.user?.name || 'Customer';
        const customerAddress = `${shippingAddr.street}, ${shippingAddr.city} - ${shippingAddr.zip}`;

        // Construct the message
        // Encode appropriately for URL
        const message = `
📦 *New Order Received!*
------------------------
*Order ID:* #${order._id.toString().slice(-8).toUpperCase()}
*Amount:* ₹${order.total.toFixed(0)}
*Payment:* ${order.paymentMethod?.type || 'COD'}

👤 *Customer:*
${customerName}
${customerAddress}

🛒 *Items:*
${order.items.map(item => `- ${item.quantity}x ${item.name || item.product?.title || 'Item'}`).join('\n')}

------------------------
_ILY mart Order Alert_
`.trim();

        // CallMeBot API URL
        // Endpoint: https://api.callmebot.com/whatsapp.php?phone=[phone]&text=[text]&apikey=[apikey]
        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${apiKey}`;

        console.log(`📱 Sending WhatsApp alert for Order #${order._id}...`);

        await axios.get(url);

        console.log('✅ WhatsApp notification sent successfully.');
        return true;
    } catch (error) {
        console.error('❌ Failed to send WhatsApp notification:', error.message);
        return false;
    }
};
