const express = require("express");
const router = express.Router();
const cronManager = require("../cron/cronManager");

router.post("/start", (req, res) => {
    const {startDate} = req.body;
    const userId = req.session.userId;

    const result = cronManager.start({userId, startDate});
    res.json(result);
});

router.post("/stop", (req, res) => {
    const result = cronManager.stop();
    res.json(result);
});

router.get("/status", async (req, res) => {
    const status = await cronManager.status(req.session.userId);
    res.json(status);
});

module.exports = router;