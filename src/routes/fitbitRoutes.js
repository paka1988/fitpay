const express = require('express');
const router = express.Router();
const fitbitService = require('../services/fitbitService');
const rewardService = require('../services/rewardService');
const userService = require('../services/userService')
const dateUtil = require('../utils/dateUtil')

router.get('/profile', async (req, res) => {
    const token = req.session.accessToken;
    if (!token) return res.status(401).send('Nicht eingeloggt');

    const profile = await fitbitService.getProfile(token);
    const currentUser = await userService.findUserById(req.session.userId);
    const userSyncStatus = await userService.checkUserSyncStatus(req.session.userId);
    profile.lastSync = currentUser.lastSync;
    profile.fullySynchronized = userSyncStatus.isFullySynced;
    res.json(profile);
});

router.get('/rewards', async (req, res) => {
    const token = req.session.accessToken;

    await rewardService.syncRewardsForToday(token, req.session.userId);
    const activities = await fitbitService.getTodayActivities(token);
    const reward_today = rewardService.calculateReward(activities);
    const currentUser = await userService.findUserById(req.session.userId)
    const reward_total = await rewardService.getRewardsSummary(
        req.session.userId,
        currentUser.memberSince,
        dateUtil.getToday()
    )
    res.json({activities, reward_today, reward_total});
});

module.exports = router;