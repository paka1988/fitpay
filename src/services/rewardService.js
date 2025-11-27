const pool = require('../db/dbconnection');
const fitbitService = require('../services/fitbitService');


function calculateReward(activities) {
    const workouts = activities?.activities || [];
    const rewardPerWorkout = 2.0; // Beispiel: 2€ pro Training
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
    const res = await pool.query(
        `SELECT date, activities, reward
         FROM fitpaydb.public.rewards
         WHERE user_id = $1
           AND date BETWEEN $2 AND $3
         ORDER BY date `,
        [userId, startDate, endDate]
    );

    return {
        startDate,
        endDate,
        summary: res.rows,
        totalEarnings: res.rows.reduce((sum, r) => sum + Number(r.reward), 0)
    };
}

async function syncRewardsFromRange(accessToken, userId, startDate, endDate) {
    const dates = [];
    let current = new Date(startDate);

    while (current <= new Date(endDate)) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }

    const results = [];

    console.log(`Number of days: ${dates.length}`)
    // for (const d of dates) {
    //     const daily = await fitbitService.getDailyActivities(accessToken, d);
    //     daily.reward = calculateReward(daily)
    //     await saveDailyReward(userId, daily.date, daily.activities.length, daily.reward);
    //     results.push(daily);
    // }

    return results;
}

module.exports = {calculateReward, syncRewardsFromRange};
