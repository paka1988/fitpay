const pool = require('../db/dbconnection');
const fitbitService = require('../services/fitbitService');
const {saveUser, findUserById} = require("./userService");
const {getToday} = require('../utils/dateUtil');

function calculateReward(activities) {
    const workouts = activities?.activities || [];
    const rewardPerWorkout = 2; // Beispiel: 2€ pro Training
    return workouts.length * rewardPerWorkout;
}

async function saveDailyReward(userId, date, activities, reward) {
    const query = `
        INSERT INTO rewards (user_id, date, activities, reward)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, date)
            DO UPDATE SET activities = $3,
                          reward     = $4;
    `;
    await pool.query(query, [userId, date, activities, reward]);
}

async function getRewardsSummary(userId, startDate, endDate) {

    const totalEarningsQuery = `
        SELECT COALESCE(SUM(reward), 0) AS total_earnings
        FROM rewards
        WHERE user_id = $1
          AND date BETWEEN $2 AND $3
    `;

    const res = await pool.query(totalEarningsQuery,
        [userId, startDate, endDate]
    );

    return {
        userId,
        startDate,
        endDate,
        totalEarnings: res.rows[0].total_earnings
    };
}

async function syncRewardsForToday(accessToken, userId) {
    const today = getToday();
    const todayActivities = await fitbitService.getDailyActivities(accessToken, today);
    await saveDailyReward(userId, todayActivities.date, todayActivities.activities.length, calculateReward(todayActivities));
}

async function syncRewardsFromRange(accessToken, userId, startDate, endDate) {

    const dates = [];
    let current = new Date(startDate);

    while (current <= new Date(endDate)) {
        dates.push(formatDateLocal(current));
        current.setDate(current.getDate() + 1);
    }

    const results = [];

    console.log(`Number of days: ${dates.length}`);

    for (const d of dates) {

        // -----------------------------
        // CALL FITBIT API + GET LIMITS
        // -----------------------------
        const daily = await fitbitService.getDailyActivities(accessToken, d);

        console.log(`Day synced: ${d} | remaining: ${daily.remaining}, reset: ${daily.reset}`);

        // -----------------------------
        // RATE LIMIT CHECK
        // -----------------------------
        if (daily.remaining !== null && daily.remaining < 10) {
            const waitSec = daily.reset || 60;

            console.log(`⚠ Fitbit rate-limit low (remaining=${daily.remaining}).`);
            console.log(`⏳ Waiting ${waitSec} seconds before continuing...`);

            await new Promise(res => setTimeout(res, waitSec * 1000));
        }

        // -----------------------------
        // PROCESS DAILY REWARD
        // -----------------------------
        daily.reward = calculateReward(daily.activities);
        await saveDailyReward(userId, daily.date, daily.activities.length, daily.reward);

        results.push(daily);
    }

    // -----------------------------
    // UPDATE USER lastSync
    // -----------------------------
    const existingUser = await findUserById(userId);
    existingUser.lastSync = endDate;
    await saveUser(existingUser);

    return results;
}


function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

module.exports = {calculateReward, syncRewardsFromRange, syncRewardsForToday, getRewardsSummary};
