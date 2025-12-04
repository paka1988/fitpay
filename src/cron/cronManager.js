const cron = require("node-cron");
const syncUserActivities = require("./tasks/syncUserActivities.js");

let task = null;

function createCronJob() {
    return cron.schedule("* * * * *", async () => {
        try {
            console.log("Cron job started");
            const result = await syncUserActivities.task();
            console.log("Cron job finished →", result);
        } catch (err) {
            console.error("Cron job failed:", err);
        }
    }, {
        scheduled: false // IMPORTANT: do not start automatically
    });
}

module.exports = {
    start() {
        if (!task) task = createCronJob();

        if (task.running) {
            return {started: false, message: "Cron job already running."};
        }
        task.start();
        return {started: true, message: "Cron job started."};
    },

    stop() {
        if (!task?.running) {
            return {stopped: false, message: "Cron job is not running."};
        }
        task.stop();
        return {stopped: true, message: "Cron job stopped."};
    },

    status() {
        return {
            running: task?.running ?? false,
            scheduleDefined: !!task
        };
    }
};
