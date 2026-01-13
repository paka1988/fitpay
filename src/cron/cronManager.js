const cron = require("node-cron");
const syncUserActivities = require("./tasks/syncUserActivities.js");
const userService = require('../services/userService')

let task = null;

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
                console.log("Reached today → auto-destroying cron task.", {userId});
                task.stop();
                task.destroy();
                task = null;
                return;
            }

            if (lastSync) {
                console.log("Updating startDate to:", {lastSync, userId});
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

        if (task?.getStatus() === 'running') {
            console.log(`Started for '${userId}', but is already running for user '${task.userId}'`)
            return {started: false, message: `Cron job status is ${task.getStatus()}`};
        }

        if (task?.getStatus() === 'idle') {
            console.log(`Started for '${userId}', but is already idling for user '${task.userId}'`)
            return {started: false, message: `Cron job status is ${task.getStatus()}`};
        }

        task = createCronJob(userId, startDate);
        task.start();
        task.userId = userId;

        console.log(`Cron job started for user '${userId}'`)

        return {started: true, message: "Cron job started."};
    },

    stop() {
        if (task?.getStatus() === 'running' || task?.getStatus() === 'idle') {
            task.destroy();
            return {stopped: true, message: "Cron job was stopped."};
        }

        return {stopped: false, message: `Cron job status is ${task.getStatus()}`};
    },

    async status(userId) {

        const userStatus = await userService.checkUserSyncStatus(userId);

        return {
            userId: userId,
            status: task?.getStatus(),
            lastSync: userStatus.lastSync,
            missingDates: userStatus.missingDates,
            scheduleDefined: !!task
        };
    }
};
