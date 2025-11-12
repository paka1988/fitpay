const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('querystring');

const { FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET, REDIRECT_URI } = process.env;

// ----------------------------------------
// 1️⃣ Fitbit Login starten
// ----------------------------------------
router.get('/fitbit', (req, res) => {
    const state = Math.random().toString(36).substring(2, 15);
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
// 2️⃣ Fitbit Callback (nach erfolgreichem Login)
// ----------------------------------------
router.get('/fitbit/callback', async (req, res) => {
    const { code, state } = req.query;

    // 🧩 CSRF-Schutz
    if (state !== req.session.oauthState) {
        return res.status(403).send('Ungültiger state-Parameter');
    }

    try {
        // ----------------------------------------
        // 3️⃣ Authorization Code gegen Access Token tauschen
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
        // 4️⃣ Token speichern (Session)
        // ----------------------------------------
        const { access_token, refresh_token, user_id } = tokenResponse.data;
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        req.session.userId = user_id;

        console.log(`✅ Fitbit login erfolgreich für user_id=${user_id}`);

        // ----------------------------------------
        // 5️⃣ Redirect zum Dashboard
        // ----------------------------------------
        res.redirect('/dashboard.html');
    } catch (err) {
        console.error('❌ Fehler beim Token-Austausch:', err.response?.data || err.message);
        res.status(500).send('Fehler beim Fitbit Login. Details siehe Server-Logs.');
    }
});

// ----------------------------------------
// 6️⃣ Logout (optional, für Button später)
// ----------------------------------------
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/index.html');
    });
});

// ----------------------------------------
// 7️⃣ Auth-Status-Check (Frontend-Fallback)
// ----------------------------------------
router.get('/status', (req, res) => {
    res.json({ authenticated: !!req.session.accessToken });
});

module.exports = router;
