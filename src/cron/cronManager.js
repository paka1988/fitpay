const cron = require("node-cron");
const syncUserActivities = require("./tasks/syncUserActivities.js");

let task = null;
let isRunning = false; // <-- TRACK THE RUN STATE YOURSELF

function createCronJob(userId, startDate) {
    return cron.schedule("* * * * *", async () => {
        try {
            console.log("Cron job started", {userId, startDate});
            let result = await syncUserActivities.task({
                userId,
                startDate,
            });

            const lastSync = result?.lastSync;

            // ---- Auto-destroy when lastSync >= today ----
            if (lastSync && syncUserActivities.hasReachedToday(lastSync)) {
                console.log("Reached today → auto-destroying cron task.");
                task.stop();
                task.destroy();
                task = null;
                isRunning = false;
                return;
            }

            if (lastSync) {
                console.log("Updating startDate to:", lastSync);
                startDate = lastSync;
            }

            const msg = result?.msg || result

            console.log("Cron job finished →", msg);
        } catch (err) {
            console.error("Cron job failed:", err);
        }
    }, {
        scheduled: false
    });
}

module.exports = {
    start(options = {}) {
        const {userId = null, startDate = null} = options;

        task = createCronJob(userId, startDate);

        if (isRunning) {
            return {started: false, message: "Cron job already running."};
        }

        task.start();
        isRunning = true; // <-- UPDATE FLAG

        return {started: true, message: "Cron job started."};
    },

    stop() {
        if (!isRunning) {
            return {stopped: false, message: "Cron job is not running."};
        }

        task.destroy();
        isRunning = false; // <-- UPDATE FLAG

        return {stopped: true, message: "Cron job stopped."};
    },

    status() {
        return {
            running: isRunning,
            scheduleDefined: !!task
        };
    }
};
