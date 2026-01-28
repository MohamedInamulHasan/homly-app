// Helper function to get store name by storeId
// Add this to any component that needs to display store names
// Usage: const storeName = getStoreName(item.storeId, stores);

export const getStoreName = (storeId, stores) => {
    // Handle missing parameters
    if (!storeId) {
        // console.warn('getStoreName: storeId is missing'); // Remove warning to reduce noise
        return 'Unknown Store';
    }

    // Check if storeId is likely a populated object (has name field)
    if (typeof storeId === 'object' && storeId.name) {
        return storeId.name;
    }

    // Check if storeId is an object but maybe just has _id (unlikely with select: 'name' but possible)
    const idToSearch = (typeof storeId === 'object' && (storeId._id || storeId.id))
        ? (storeId._id || storeId.id)
        : storeId;

    if (!stores || !Array.isArray(stores)) {
        // console.warn('getStoreName: stores array is missing or invalid');
        return 'Unknown Store';
    }

    // Find the store by ID
    const store = stores.find(s => {
        const sId = s._id || s.id;
        return sId === idToSearch || String(sId) === String(idToSearch);
    });

    if (!store) {
        // console.warn(`getStoreName: Store not found for storeId: ${idToSearch}`);
        return 'Unknown Store';
    }

    return store.name || 'Unknown Store';
};

// Parse time string (HH:MM) to minutes since midnight
export const parseTime = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
};

// Get current time in minutes since midnight
export const getCurrentTimeInMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

// Check if a store is currently open based on opening and closing times
export const isStoreOpen = (store) => {
    if (!store) return false;

    // If store has openingTime and closingTime, use those
    if (store.openingTime && store.closingTime) {
        const currentMinutes = getCurrentTimeInMinutes();
        const openingMinutes = parseTime(store.openingTime);
        const closingMinutes = parseTime(store.closingTime);

        if (openingMinutes === null || closingMinutes === null) {
            return true; // If parsing fails, assume open
        }

        // Handle cases where closing time is after midnight (e.g., 02:00)
        if (closingMinutes < openingMinutes) {
            // Store is open past midnight
            return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
        } else {
            // Normal case
            return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
        }
    }

    // Fallback: if only timing string exists, try to parse it
    if (store.timing) {
        // Try to extract times from format like "9:00 AM - 9:00 PM"
        const match = store.timing.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (match) {
            let openHour = parseInt(match[1]);
            const openMin = parseInt(match[2]);
            const openPeriod = match[3];
            let closeHour = parseInt(match[4]);
            const closeMin = parseInt(match[5]);
            const closePeriod = match[6];

            // Convert to 24-hour format
            if (openPeriod && openPeriod.toUpperCase() === 'PM' && openHour !== 12) {
                openHour += 12;
            } else if (openPeriod && openPeriod.toUpperCase() === 'AM' && openHour === 12) {
                openHour = 0;
            }

            if (closePeriod && closePeriod.toUpperCase() === 'PM' && closeHour !== 12) {
                closeHour += 12;
            } else if (closePeriod && closePeriod.toUpperCase() === 'AM' && closeHour === 12) {
                closeHour = 0;
            }

            const currentMinutes = getCurrentTimeInMinutes();
            const openingMinutes = openHour * 60 + openMin;
            const closingMinutes = closeHour * 60 + closeMin;

            if (closingMinutes < openingMinutes) {
                return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
            } else {
                return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
            }
        }
    }

    // If we can't determine, assume the store is open
    return true;
};
