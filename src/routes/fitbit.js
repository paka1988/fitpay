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

    const profile = await fitbitService.getProfile(token);
    const today = new Date().toISOString().split('T')[0]; // e.g., '2025-11-10'
    const total_activities = await rewardService.syncRewardsFromRange(token, req.session.userId, profile.user.memberSince, today);
    const activities = await fitbitService.getTodayActivities(token);
    const reward = rewardService.calculateReward(activities);
    const reward_total = total_activities.reduce((sum, {activities}) => sum + activities, 0);
    res.json({activities, reward, reward_total});
});

module.exports = router;