// Add this new function to emailService.js

export const sendCustomerOrderConfirmationEmail = async (order) => {
    try {
        const customerEmail = order.user?.email;

        if (!customerEmail) {
            console.error('❌ No customer email found!');
            return;
        }

        console.log('📧 Sending order confirmation to customer:', customerEmail);

        // Extract shipping address fields
        const shippingAddr = order.shippingAddress || {};
        const customerName = shippingAddr.name || order.user?.name || 'Customer';
        const customerMobile = shippingAddr.mobile || 'N/A';
        const customerAddress = shippingAddr.street || 'N/A';
        const customerCity = shippingAddr.city || 'N/A';
        const customerLocation = shippingAddr.location || '';

        const mailOptions = {
            from: `"ILY mart" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2563eb; margin-bottom: 10px;">✅ Order Confirmed!</h2>
                        <p style="color: #6b7280; margin-bottom: 30px;">Thank you for your order, ${customerName}!</p>
                        
                        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2563eb;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Order Details</h3>
                            <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.total.toFixed(0)}</p>
                            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod?.type || 'Cash on Delivery'}</p>
                            ${order.scheduledDeliveryTime ? `<p style="margin: 5px 0;"><strong>Delivery Time:</strong> ${new Date(order.scheduledDeliveryTime).toLocaleString()}</p>` : ''}
                        </div>

                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Delivery Address</h3>
                            <p style="margin: 5px 0;">${customerAddress}</p>
                            <p style="margin: 5px 0;">${customerCity}</p>
                            <p style="margin: 5px 0;"><strong>Mobile:</strong> ${customerMobile}</p>
                            ${customerLocation ? `<p style="margin: 10px 0 0 0;"><a href="${customerLocation}" style="color: #2563eb; text-decoration: none;">📍 View Location on Map</a></p>` : ''}
                        </div>

                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Order Items</h3>
                            ${order.items.map(item => `
                                <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                    <p style="margin: 5px 0;"><strong>${item.name || item.title || 'Product'}</strong></p>
                                    <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Quantity: ${item.quantity} × ₹${item.price.toFixed(0)} = ₹${(item.price * item.quantity).toFixed(0)}</p>
                                    ${item.storeId?.name ? `<p style="margin: 5px 0; color: #6b7280; font-size: 12px;">Store: ${item.storeId.name}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>

                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₹${(order.total - (order.shipping || 0)).toFixed(0)}</p>
                            <p style="margin: 5px 0;"><strong>Delivery Charge:</strong> ${order.shipping === 0 ? (order.items.some(i => i.isGold) ? 'FREE (Gold Member)' : 'FREE (Coin Applied)') : `₹${(order.shipping || 0).toFixed(0)}`}</p>
                            <p style="margin: 10px 0 0 0; font-size: 18px;"><strong>Total:</strong> <span style="color: #2563eb;">₹${order.total.toFixed(0)}</span></p>
                        </div>

                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; margin-bottom: 15px;">Your order is being processed and will be delivered soon!</p>
                            <p style="color: #9ca3af; font-size: 12px;">If you have any questions, please contact us.</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} ILY mart. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await getTransporter().sendMail(mailOptions);
        console.log('✅ Customer order confirmation email sent!');
        console.log('✅ Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send customer confirmation email:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code
        });
        return { success: false, error: error.message };
    }
};
