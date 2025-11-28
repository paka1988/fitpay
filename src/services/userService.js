const pool = require('../db/dbconnection');
const User = require('../entities/user');

async function saveUser(user) {
    if (!user?.userId) {
        throw new Error('Invalid user entity passed to saveUser');
    }

    const query = `
        INSERT INTO users (user_id, access_token, refresh_token, token_expires_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, now(), now())
        ON CONFLICT (user_id) DO UPDATE
            SET access_token     = EXCLUDED.access_token,
                refresh_token    = EXCLUDED.refresh_token,
                token_expires_at = EXCLUDED.token_expires_at,
                updated_at       = now()
        RETURNING user_id, access_token, refresh_token, token_expires_at;
    `;

    const params = [
        user.userId,
        user.accessToken,
        user.refreshToken,
        user.tokenExpiresAt ? user.tokenExpiresAt.toISOString() : null
    ];

    const result = await pool.query(query, params);
    return new User(result.rows[0]);
}

module.exports = {saveUser};