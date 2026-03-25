import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.error('❌ Auth Failed: User not found in DB for token payload:', decoded);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('❌ Auth Failed: Token verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.error('❌ Auth Failed: No token provided in cookies or header');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Optional Auth - populates req.user if token exists, otherwise proceeds as guest
export const optionalAuth = async (req, res, next) => {
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            // If user not found, just proceed as guest (req.user remains undefined)
        } catch (error) {
            // Token invalid or expired - just proceed as guest
            console.log('⚠️ Optional Auth: Token invalid/expired, proceeding as guest.');
        }
    }

    next();
};

// Admin middleware
export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        console.error('⛔ Admin Access Denied. User Role:', req.user ? req.user.role : 'No User');
        return res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Admin OR Store Admin middleware
export const adminOrStoreAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'store_admin')) {
        next();
    } else {
        console.error('⛔ Access Denied. User Role:', req.user ? req.user.role : 'No User');
        return res.status(403).json({ message: 'Not authorized as admin or store admin' });
    }
};

// Admin OR Service Admin middleware
export const adminOrServiceAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'service_admin')) {
        next();
    } else {
        console.error('⛔ Access Denied. User Role:', req.user ? req.user.role : 'No User');
        return res.status(403).json({ message: 'Not authorized as admin or service admin' });
    }
};

// Admin OR Delivery Boy middleware
export const adminOrDelivery = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'delivery_boy')) {
        next();
    } else {
        console.error('⛔ Access Denied. User Role:', req.user ? req.user.role : 'No User');
        return res.status(403).json({ message: 'Not authorized as admin or delivery boy' });
    }
};

// Any Role with Admin Access (Admin, Store, Service, Delivery)
export const anyAdmin = (req, res, next) => {
    const roles = ['admin', 'store_admin', 'service_admin', 'delivery_boy'];
    if (req.user && roles.includes(req.user.role)) {
        next();
    } else {
        console.error('⛔ Access Denied. User Role:', req.user ? req.user.role : 'No User');
        return res.status(403).json({ message: 'Not authorized' });
    }
};
