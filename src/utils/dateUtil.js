// dateUtil.js

/**
 * Returns today's date in YYYY-MM-DD format.
 */
function getToday() {
    const now = new Date();
    return formatDate(now);
}

/**
 * Adds N days to a given date (does NOT mutate input).
 */
function addDay(date, days = 1) {
    const d = toDate(date);
    const newDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
    return formatDate(newDate);
}

/**
 * Subtracts N days from a given date.
 */
function minusDay(date, days = 1) {
    return addDay(date, -days);
}

// ----------------------------
// Internal helpers
// ----------------------------

function toDate(val) {
    if (val instanceof Date) return new Date(val);

    if (typeof val === "string") {
        const parsed = new Date(val);
        if (isNaN(parsed)) {
            throw new Error(`Invalid date string: "${val}"`);
        }
        return parsed;
    }

    throw new Error(`Unsupported date type: ${typeof val}`);
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Export as module
module.exports = {getToday, addDay, minusDay};
