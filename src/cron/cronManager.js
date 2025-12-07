const cron = require("node-cron");
const syncUserActivities = require("./tasks/syncUserActivities.js");

let task = null;
let isRunning = false; // <-- TRACK THE RUN STATE YOURSELF

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
        scheduled: false
    });
}

module.exports = {
    start() {
        if (!task) task = createCronJob();

        if (isRunning) {
            return { started: false, message: "Cron job already running." };
        }

        task.start();
        isRunning = true; // <-- UPDATE FLAG

        return { started: true, message: "Cron job started." };
    },

    stop() {
        if (!isRunning) {
            return { stopped: false, message: "Cron job is not running." };
        }

        task.stop();
        isRunning = false; // <-- UPDATE FLAG

        return { stopped: true, message: "Cron job stopped." };
    },

    status() {
        return {
            running: isRunning,
            scheduleDefined: !!task
        };
    }
};
