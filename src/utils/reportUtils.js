
import { Timestamp } from 'firebase/firestore';

/**
 * Groups consumption and waste data by month.
 * @param {Array} consumed - Array of consumed fruit objects.
 * @param {Array} wasted - Array of wasted fruit objects.
 * @returns {Object} - Object keyed by "YYYY-MM" containing aggregated stats.
 */
export const groupDataByMonth = (consumed = [], wasted = []) => {
    const monthlyData = {};

    const processItem = (item, type) => {
        // Normalize timestamp field
        const rawDate = item.timestamp || item.consumedAt || item.wasteDate || item.date;
        if (!rawDate) return;

        let date;
        // Handle Firestore Timestamp or JS Date object or string
        if (rawDate && typeof rawDate.toDate === 'function') {
            // Firestore Timestamp
            date = rawDate.toDate();
        } else if (rawDate instanceof Date) {
            date = rawDate;
        } else {
            date = new Date(rawDate);
        }

        if (isNaN(date.getTime())) return; // invalid date


        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        const key = `${month} ${year}`; // e.g., "December 2025"

        if (!monthlyData[key]) {
            monthlyData[key] = {
                month: month,
                year: year,
                displayName: key,
                consumedCount: 0,
                wasteCount: 0,
                items: [] // Combined list for detailed view if needed
            };
        }

        if (type === 'consumed') {
            monthlyData[key].consumedCount += (item.amount || 1);
        } else {
            monthlyData[key].wasteCount += (item.amount || 1);
        }

        monthlyData[key].items.push({ ...item, type });
    };

    consumed.forEach(item => processItem(item, 'consumed'));
    wasted.forEach(item => processItem(item, 'waste'));

    // Sort months descending (current month first)
    return Object.values(monthlyData).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months.indexOf(b.month) - months.indexOf(a.month);
    });
};

/**
 * Calculates efficiency score for a monthly report.
 * @param {Number} consumed 
 * @param {Number} wasted 
 * @returns {Number} percentage (0-100)
 */
export const calculateMonthlyEfficiency = (consumed, wasted) => {
    const total = consumed + wasted;
    if (total === 0) return 100;
    return Math.round((consumed / total) * 100);
};

/**
 * Generates a "Fruit Persona" based on monthly data.
 * @param {Object} monthStats 
 * @returns {String} Persona title
 */
export const getMonthlyPersona = (monthStats) => {
    const { consumedCount, wasteCount } = monthStats;
    const efficiency = calculateMonthlyEfficiency(consumedCount, wasteCount);
    const total = consumedCount + wasteCount;

    if (total === 0) return "The Hibernator";
    if (efficiency >= 95 && total > 20) return "Eco-Warrior";
    if (efficiency >= 80) return "Fruit Enthusiast";
    if (wasteCount > consumedCount) return "Compost King";
    return "Balanced Eater";
};
