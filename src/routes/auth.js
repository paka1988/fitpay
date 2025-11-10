const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('querystring');

// Environment variables
const { FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET, REDIRECT_URI } = process.env;

// ----------------------------------------
// 1️⃣ Redirect to Fitbit Authorization Page
// ----------------------------------------
router.get('/fitbit', (req, res) => {
    const state = Math.random().toString(36).substring(2, 15); // Random state
    req.session.oauthState = state;

    const authUrl = `https://www.fitbit.com/oauth2/authorize?${qs.stringify({
        response_type: 'code',
        client_id: FITBIT_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'activity profile',
        state,
    })}`;

    res.redirect(authUrl);
});

// ----------------------------------------
// 2️⃣ Callback from Fitbit after login
// ----------------------------------------
router.get('/fitbit/callback', async (req, res) => {
    const { code, state } = req.query;

    // Check state for CSRF protection
    if (state !== req.session.oauthState) {
        return res.status(403).send('Ungültiger state-Parameter');
    }

    try {
        // ----------------------------------------
        // 3️⃣ Exchange authorization code for access token
        // ----------------------------------------
        const tokenResponse = await axios.post(
            'https://api.fitbit.com/oauth2/token',
            qs.stringify({
                client_id: FITBIT_CLIENT_ID,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code,
            }),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // ----------------------------------------
        // 4️⃣ Store tokens in session (or DB)
        // ----------------------------------------
        const { access_token, refresh_token, user_id } = tokenResponse.data;
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;

        // Send simple success page
        res.send(`
      <h2>Fitbit OAuth erfolgreich!</h2>
      <p>User ID: ${user_id}</p>
      <p>Access Token wurde in der Session gespeichert.</p>
      <a href="/fitbit/profile">Profil anzeigen</a>
    `);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).send('Fehler beim Token-Austausch');
    }
});

module.exports = router;
