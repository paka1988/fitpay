const express = require('express');
const router = express.Router();
const fitbitService = require('../services/fitbitService');
const rewardService = require('../services/rewardService');

router.get('/profile', async (req, res) => {
    const token = req.session.accessToken;
    if (!token) return res.status(401).send('Nicht eingeloggt');

    const profile = await fitbitService.getProfile(token);
    res.json(profile);
});

router.get('/rewards', async (req, res) => {
    const token = req.session.accessToken;
    const activities = await fitbitService.getTodayActivities(token);
    const reward = rewardService.calculateReward(activities);
    res.json({ activities, reward });
});

router.get('/today', async (req, res) => {
    const data = await fitbitService.getTodayActivities(req.session.accessToken);
    res.json(data);
});

module.exports = router;