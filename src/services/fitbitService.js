const axios = require('axios');
const {logAxiosError} = require("../utils/logger");


async function getProfile(accessToken) {
    try {
        const res = await axios.get('https://api.fitbit.com/1/user/-/profile.json', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
    } catch (err) {
        logAxiosError(err); // log full error details
        throw new Error('Failed to fetch Fitbit profile. See server logs.');
    }
}

async function getTodayActivities(accessToken) {
    try {

        // get today's date in yyyy-MM-dd
        const today = new Date().toISOString().split('T')[0]; // e.g., '2025-11-10'

        const res = await axios.get(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return res.data;
    } catch (err) {
        logAxiosError(err); // log full error details
        throw new Error('Failed to fetch today\'s Fitbit activities. See server logs.');
    }
}

module.exports = { getProfile, getTodayActivities };
