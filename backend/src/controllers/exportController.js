import ExcelJS from 'exceljs';
import Order from '../models/Order.js';
import LoginLog from '../models/LoginLog.js';
import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';

// @desc    Export All Data to Excel (Users, Orders, Services, Logins)
// @route   GET /api/admin/export-data
// @access  Private/Admin
export const exportData = async (req, res, next) => {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Homly Admin';
        workbook.lastModifiedBy = 'Homly Admin';
        workbook.created = new Date();
        workbook.modified = new Date();

        // ==========================================
        // PREPARE DATA AGGREGATION
        // ==========================================
        const allOrders = await Order.find({});
        const allServiceRequests = await ServiceRequest.find({});

        // Map: UserID -> Order Stats
        const userOrdersMap = {};
        allOrders.forEach(order => {
            if (order.user) {
                const uid = order.user.toString();
                if (!userOrdersMap[uid]) {
                    userOrdersMap[uid] = { count: 0, totalSpent: 0, lastOrderDate: null };
                }
                userOrdersMap[uid].count++;
                userOrdersMap[uid].totalSpent += (order.total || 0);

                const d = new Date(order.createdAt);
                if (!userOrdersMap[uid].lastOrderDate || d > userOrdersMap[uid].lastOrderDate) {
                    userOrdersMap[uid].lastOrderDate = d;
                }
            }
        });

        // Map: UserID -> Service Request Count
        const userServiceMap = {};
        allServiceRequests.forEach(req => {
            if (req.user) {
                const uid = req.user.toString();
                userServiceMap[uid] = (userServiceMap[uid] || 0) + 1;
            }
        });

        // ==========================================
        // SHEET 1: USERS (With Aggregates)
        // ==========================================
        const userSheet = workbook.addWorksheet('Users');
        userSheet.columns = [
            { header: 'User ID', key: 'id', width: 25 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Mobile', key: 'mobile', width: 15 },
            { header: 'Role', key: 'role', width: 10 },
            { header: 'Coins', key: 'coins', width: 10 },
            { header: 'Location', key: 'location', width: 15 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'Fast Mode', key: 'fastMode', width: 10 },
            { header: 'Total Orders', key: 'totalOrders', width: 15 },
            { header: 'Total Spent', key: 'totalSpent', width: 15 },
            { header: 'Last Order', key: 'lastOrder', width: 20 },
            { header: 'Service Reqs', key: 'serviceRequests', width: 15 },
            { header: 'Joined Date', key: 'joined', width: 20 }
        ];

        const users = await User.find({}).sort({ createdAt: -1 });
        users.forEach(user => {
            const userId = user._id.toString();
            const addressStr = user.address ? `${user.address.street || ''}, ${user.address.city || ''}` : '';
            const orderStats = userOrdersMap[userId] || { count: 0, totalSpent: 0, lastOrderDate: null };
            const serviceCount = userServiceMap[userId] || 0;

            userSheet.addRow({
                id: userId,
                name: user.name,
                email: user.email,
                mobile: user.mobile || '',
                role: user.role,
                coins: user.coins,
                location: user.location || '',
                address: addressStr,
                fastMode: user.isFastMode ? 'Yes' : 'No',
                totalOrders: orderStats.count,
                totalSpent: orderStats.totalSpent,
                lastOrder: orderStats.lastOrderDate ? orderStats.lastOrderDate.toLocaleString() : '-',
                serviceRequests: serviceCount,
                joined: user.createdAt ? new Date(user.createdAt).toLocaleString() : ''
            });
        });

        // ==========================================
        // SHEET 2: ORDER HISTORY (Granular - One Row Per Item)
        // ==========================================
        const orderSheet = workbook.addWorksheet('Order History');
        orderSheet.columns = [
            { header: 'Order ID', key: 'id', width: 25 },
            { header: 'Order Date', key: 'date', width: 20 },
            { header: 'Scheduled Delivery', key: 'scheduled', width: 20 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
            { header: 'Customer Email', key: 'customerEmail', width: 25 },
            { header: 'Customer Mobile', key: 'customerMobile', width: 15 },
            { header: 'Full Shipping Address', key: 'address', width: 40 },
            { header: 'Map Link', key: 'mapLink', width: 25 }, // New Column

            // Product Details
            { header: 'Product Name', key: 'productName', width: 30 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'Price', key: 'price', width: 10 },
            { header: 'Is Gold', key: 'isGold', width: 10 },
            { header: 'Is Offer', key: 'isOffer', width: 10 },

            { header: 'Offer/Discount', key: 'discount', width: 15 },
            { header: 'Order Total', key: 'total', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 }
        ];

        const orders = await Order.find({})
            .populate('user', 'name email mobile')
            .sort({ createdAt: -1 });

        orders.forEach(order => {
            const addressString = `${order.shippingAddress?.street}, ${order.shippingAddress?.city}`;
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';
            const scheduledDate = order.scheduledDeliveryTime ? new Date(order.scheduledDeliveryTime).toLocaleString() : 'Immediate';
            const customerName = order.user?.name || order.shippingAddress?.name || 'Guest';
            const customerEmail = order.user?.email || order.shippingAddress?.email || '';
            const customerMobile = order.user?.mobile || order.shippingAddress?.mobile || '';
            const discount = order.discount > 0 ? order.discount : '0';
            const total = order.total;
            const status = order.status;
            const paymentMethod = order.paymentMethod?.type || 'Cash';

            // Track start row for this order to merge duplicate cells later
            const startRow = orderSheet.rowCount + 1;

            // Loop through items to create granular rows
            order.items.forEach(item => {
                orderSheet.addRow({
                    id: order._id.toString(),
                    date: orderDate,
                    scheduled: scheduledDate,
                    customerName: customerName,
                    customerEmail: customerEmail,
                    customerMobile: customerMobile,
                    address: addressString,
                    mapLink: order.shippingAddress?.location
                        ? { text: 'View on Map', hyperlink: `https://www.google.com/maps?q=${order.shippingAddress.location}` }
                        : 'N/A',

                    productName: item.name,
                    quantity: item.quantity,
                    unit: item.unit || '-',
                    price: item.price,
                    isGold: item.isGold ? 'YES' : 'No',
                    isOffer: item.isFromAd ? 'YES' : 'No',

                    discount: discount,
                    total: total,
                    status: status,
                    paymentMethod: paymentMethod
                });
            });

            const endRow = orderSheet.rowCount;

            // Merge Cells if order has multiple items
            if (endRow > startRow) {
                // Columns to merge: 1-8 (Order/User/Map) AND 15-18 (Totals/Status)
                // Columns 9-14 are Item Details (Do NOT Merge)
                const columnsToMerge = [1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18];

                columnsToMerge.forEach(colIndex => {
                    orderSheet.mergeCells(startRow, colIndex, endRow, colIndex);
                });
            }

            // Apply Vertical Middle Alignment to these rows for better readability
            for (let r = startRow; r <= endRow; r++) {
                const row = orderSheet.getRow(r);
                row.eachCell((cell) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                });
            }
        });

        // ==========================================
        // SHEET 3: SERVICE REQUESTS
        // ==========================================
        const serviceSheet = workbook.addWorksheet('Service Requests');
        serviceSheet.columns = [
            { header: 'Request ID', key: 'id', width: 25 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
            { header: 'Customer Email', key: 'customerEmail', width: 25 },
            { header: 'Service Name', key: 'serviceName', width: 25 },
            { header: 'Location', key: 'location', width: 30 },
            { header: 'GPS Coordinates', key: 'coordinates', width: 20 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        const serviceRequests = await ServiceRequest.find({})
            .populate('user', 'name email')
            .populate('service', 'name')
            .sort({ createdAt: -1 });

        serviceRequests.forEach(req => {
            serviceSheet.addRow({
                id: req._id.toString(),
                date: req.createdAt ? new Date(req.createdAt).toLocaleString() : '',
                customerName: req.user?.name || 'Unknown',
                customerEmail: req.user?.email || '',
                serviceName: req.service?.name || 'Deleted Service',
                location: req.location || '',
                coordinates: req.coordinates || '',
                status: req.status
            });
        });

        // ==========================================
        // SHEET 4: LOGIN HISTORY
        // ==========================================
        const loginSheet = workbook.addWorksheet('Login History');
        loginSheet.columns = [
            { header: 'User Name', key: 'userName', width: 20 },
            { header: 'User Email', key: 'userEmail', width: 25 },
            { header: 'Role', key: 'role', width: 10 },
            { header: 'Login Time', key: 'loginTime', width: 20 },
            { header: 'IP Address', key: 'ip', width: 15 },
            { header: 'Device', key: 'device', width: 40 }
        ];

        const loginLogs = await LoginLog.find({})
            .populate('user', 'name email role')
            .sort({ loginTime: -1 });

        loginLogs.forEach(log => {
            if (log.user) {
                loginSheet.addRow({
                    userName: log.user.name,
                    userEmail: log.user.email,
                    role: log.user.role,
                    loginTime: log.loginTime ? new Date(log.loginTime).toLocaleString() : '',
                    ip: log.ipAddress || '',
                    device: log.device || ''
                });
            }
        });

        // Generate Filename with Timestamp
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-').split('T').join('_').slice(0, 19); // YYYY-MM-DD_HH-mm-ss
        const filename = `ILY_mart_Store_Export_${timestamp}.xlsx`;

        // Set Response Headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${filename}`
        );

        await workbook.xlsx.write(res);
        res.status(200).end();

    } catch (error) {
        next(error);
    }
};
