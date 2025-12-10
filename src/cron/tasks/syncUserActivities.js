const {findAllUsers, findUserById} = require('../../services/userService')
const {syncRewardsFromRange} = require('../../services/rewardService')
const {getAPIRequestLimit} = require('../../services/fitbitService')

exports.task = async ({userId = null, startDate = null} = {}) => {

    console.log("🔄 Syncing with parameters:", {userId, startDate});

    try {
        // 1️⃣ Fetch only necessary users
        let users = [];

        if (userId) {
            const user = await findUserById(userId);
            if (!user) {
                console.warn(`❗ User ${userId} not found — nothing to sync.`);
                return `No user with id ${userId}`;
            }
            users = [user];
        } else {
            users = await findAllUsers();
        }

        if (!users?.length) {
            console.warn("⚠ No users found");
            return "No users synchronized.";
        }

        const today = new Date().toISOString().split("T")[0];
        const syncedUsers = [];

        // 2️⃣ Parallel sync
        const promises = users.map(async (user) => {
            try {
                const lastSyncDate = startDate || user.lastSync || user.memberSince;

                if (!isValidDate(lastSyncDate)) {
                    console.error(`❌ Invalid date for user ${user.userId}: ${lastSyncDate}`);
                    return;
                }

                // 3️⃣ Calculate date range
                const limit = getAPIRequestLimit();
                const daysDiff = calculateDays(lastSyncDate, today);

                const endDate = daysDiff < limit ? today : datePlusDays(lastSyncDate, limit);

                console.log(`📅 Syncing user ${user.userId}: ${lastSyncDate} → ${endDate}`);

                // 4️⃣ Do actual sync
                await syncRewardsFromRange(
                    user.accessToken,
                    user.userId,
                    lastSyncDate,
                    endDate
                );

                syncedUsers.push(user.userId);
            } catch (err) {
                console.error(`❌ User ${user.userId} sync failed:`, err);
            }
        });

        await Promise.all(promises);

        // 5️⃣ Summary
        if (!syncedUsers.length) {
            return "Sync finished — but no users updated.";
        }

        const updatedUser = await findUserById(userId);

        return {
            msg: `Task finished synchronization for users: ${syncedUsers.join(", ")}`,
            lastSync: updatedUser.lastSync
        };

    } catch (err) {
        console.error("🔥 User sync task failed:", err);
        return "Task failed — check logs for details.";
    }
};

// --- Helpers ---
function isValidDate(date) {
    return date && !Number.isNaN(new Date(date).getTime());
}

function datePlusDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date;
}

function calculateDays(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let timeDifference = end - start;
    return timeDifference / (1000 * 3600 * 24);
}

exports.hasReachedToday = (lastSyncISO, tz = "Europe/Berlin") => {
    const now = new Date().toLocaleString("en-US", {timeZone: tz});
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const last = new Date(
        new Date(lastSyncISO).toLocaleString("en-US", {timeZone: tz})
    );
    last.setHours(0, 0, 0, 0);

    return last >= today;
}
