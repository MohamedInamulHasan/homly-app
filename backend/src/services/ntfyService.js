// ntfy.sh Push Notification Service
// Sends instant sound + vibration alerts to the admin's phone via the ntfy app

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'homly-alerts-556677';
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

/**
 * Send a push notification via ntfy.sh
 * @param {string} title - Notification title (bold header)
 * @param {string} message - Notification body text
 * @param {string} priority - 'max', 'high', 'default', 'low', 'min'
 * @param {string} tags - Comma-separated emoji tags e.g. 'shopping_bags,bell'
 */
const sendNtfyNotification = async (title, message, priority = 'high', tags = 'bell') => {
    try {
        const response = await fetch(NTFY_URL, {
            method: 'POST',
            headers: {
                'Title': title,
                'Priority': priority,
                'Tags': tags,
                'Content-Type': 'text/plain',
            },
            body: message,
        });

        if (response.ok) {
            console.log(`🔔 ntfy notification sent: "${title}"`);
            return { success: true };
        } else {
            console.error(`❌ ntfy error: ${response.status} ${response.statusText}`);
            return { success: false };
        }
    } catch (error) {
        console.error('❌ Failed to send ntfy notification:', error.message);
        return { success: false };
    }
};

/**
 * Send ntfy alert when a new order is placed
 */
export const sendOrderNtfyAlert = async (order) => {
    try {
        const customerName = order.shippingAddress?.name || order.user?.name || 'Guest';
        const customerMobile = order.shippingAddress?.mobile || 'N/A';
        const itemCount = order.items?.length || 0;
        const total = order.total || 0;
        const itemNames = order.items?.map(i => i.name || i.productName || 'Item').slice(0, 3).join(', ') || 'Items';

        const title = `🛍️ New Order! ₹${total}`;
        const message = `Customer: ${customerName}\nMobile: ${customerMobile}\nItems (${itemCount}): ${itemNames}\nTotal: ₹${total}\nPayment: ${order.paymentMethod || 'COD'}`;

        return await sendNtfyNotification(title, message, 'max', 'shopping_bags,rotating_light');
    } catch (error) {
        console.error('❌ Failed to send order ntfy alert:', error);
        return { success: false };
    }
};

/**
 * Send ntfy alert when a new service request is placed
 */
export const sendServiceRequestNtfyAlert = async (serviceRequest) => {
    try {
        const customerName = serviceRequest.user?.name || 'Customer';
        const customerMobile = serviceRequest.user?.mobile || 'N/A';
        const serviceName = serviceRequest.service?.name || 'Service';
        const location = serviceRequest.location || 'No location provided';

        const title = `🔧 New Service Request!`;
        const message = `Service: ${serviceName}\nCustomer: ${customerName}\nMobile: ${customerMobile}\nLocation: ${location}`;

        return await sendNtfyNotification(title, message, 'max', 'wrench,rotating_light');
    } catch (error) {
        console.error('❌ Failed to send service request ntfy alert:', error);
        return { success: false };
    }
};
