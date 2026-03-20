// Debug script to check order data structure
// Run this in browser console to see what's in your orders

console.log('=== ORDER DEBUG INFO ===');

// Get orders from localStorage or context
const checkOrders = () => {
    // Try to get from localStorage first
    const ordersStr = localStorage.getItem('orders');
    if (ordersStr) {
        const orders = JSON.parse(ordersStr);
        console.log('📦 Total orders:', orders.length);

        if (orders.length > 0) {
            console.log('\n📋 First order structure:');
            console.log(orders[0]);

            console.log('\n⏰ Scheduled delivery times:');
            orders.forEach((order, i) => {
                const orderId = String(order._id || order.id).slice(-6).toUpperCase();
                console.log(`Order #${orderId}:`, order.scheduledDeliveryTime || 'NOT SET');
            });
        }
    } else {
        console.log('❌ No orders found in localStorage');
    }
};

checkOrders();

console.log('\n💡 TIP: If scheduledDeliveryTime is "NOT SET", you need to:');
console.log('1. Place a NEW order with delivery time selected');
console.log('2. Or manually add scheduledDeliveryTime to existing orders in database');
