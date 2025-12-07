const express = require("express");
const router = express.Router();
const cronManager = require("../cron/cronManager");

router.post("/start", (req, res) => {
    const result = cronManager.start();
    res.json(result);
});

router.post("/stop", (req, res) => {
    const result = cronManager.stop();
    res.json(result);
});

router.get("/status", (req, res) => {
    const status = cronManager.status();
    res.json(status);
});

module.exports = router;