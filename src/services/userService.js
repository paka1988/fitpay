const {subDays} = require('date-fns');
const pool = require('../db/dbconnection');
const User = require('../entities/user');
const dateUtil = require('../utils/dateUtil')


async function saveUser(user) {
    if (!user?.userId) {
        throw new Error('Invalid user entity passed to saveUser');
    }

    const query = `
        INSERT INTO users (user_id, access_token, refresh_token, token_expires_at, member_since, last_sync, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, now(), now())
        ON CONFLICT (user_id) DO UPDATE
            SET access_token     = EXCLUDED.access_token,
                refresh_token    = EXCLUDED.refresh_token,
                token_expires_at = EXCLUDED.token_expires_at,
                last_sync        = EXCLUDED.last_sync,
                updated_at       = now()
        RETURNING user_id, access_token, refresh_token, token_expires_at;
    `;

    const params = [
        user.userId,
        user.accessToken,
        user.refreshToken,
        user.tokenExpiresAt ? user.tokenExpiresAt.toISOString() : null,
        user.memberSince,
        user.lastSync
    ];

    const result = await pool.query(query, params);
    return new User(result.rows[0]);
}

async function findAllUsers() {
    const query = `SELECT *
                   FROM users`;

    const result = await pool.query(query);
    return result.rows.map(row => {
        const {user_id, access_token, refresh_token, token_expires_at, member_since, last_sync} = row
        return new User({
            userId: user_id,
            accessToken: access_token,
            refreshToken: refresh_token,
            tokenExpiresAt: token_expires_at,
            memberSince: member_since,
            lastSync: last_sync
        });
    })
}

const findUserById = async (userId) => {
    try {
        // Query to find a user by ID
        const query = 'SELECT * FROM users WHERE user_id = $1';
        const result = await pool.query(query, [userId]);

        // If no user is found, return null
        if (result.rows.length === 0) {
            return null;
        }

        // Return the user data (assuming you're returning the first match)
        return new User({
            userId: result.rows[0].user_id,
            accessToken: result.rows[0].access_token,
            refreshToken: result.rows[0].refresh_token,
            tokenExpiresAt: result.rows[0].token_expires_at,
            memberSince: result.rows[0].member_since,
            lastSync: result.rows[0].last_sync,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at
        })
    } catch (error) {
        console.error(`Error finding user with ID ${userId}:`, error);
        throw new Error('Failed to find user.');
    }
};

const checkUserSyncStatus = async (userId) => {

    const user = await findUserById(userId);
    const startDate = user.memberSince
    const endDate = subDays(new Date(), 1) // last complete Fitbit day

    const {rows} = await pool.query(`
        WITH expected_dates AS (SELECT generate_series($1::date, $2::date, interval '1 day')::date AS date)
        SELECT to_char(e.date, 'YYYY-MM-DD') AS missing_date
        FROM expected_dates e
                 LEFT JOIN rewards r
                           ON r.user_id = $3 AND r.date = e.date
        WHERE r.date IS NULL
        ORDER BY e.date;
    `, [dateUtil.formatDate(startDate), dateUtil.formatDate(endDate), user.userId])

    const missingDates = rows.map(r => r.missing_date)

    return {
        isFullySynced: missingDates.length === 0,
        missingDates: missingDates
    }
}


module.exports = {saveUser, findAllUsers, findUserById, checkUserSyncStatus};