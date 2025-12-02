const {findAllUsers} = require('../../services/userService')
const {syncRewardsFromRange} = require('../../services/rewardService')
const {getAPIRequestLimit} = require('../../services/fitbitService')

exports.task = async (ctx) => {
    try {
        const users = await findAllUsers();

        if (!users?.length) {
            console.warn('No users found');
            return 'No users synchronized.';
        }

        const today = new Date().toISOString().split('T')[0];
        const syncedUsers = [];

        const promises = users.map(async (user) => {
            const lastSync = user.lastSync || user.memberSince;

            if (!isValidDate(lastSync)) {
                console.error(`Invalid date for user ${user.userId}: ${lastSync}`);
                return;
            }

            const daysDiff = calculateDays(lastSync, today);
            const limit = getAPIRequestLimit();

            const endDate = daysDiff < limit ? today : datePlusDays(lastSync, limit);

            try {
                await syncRewardsFromRange(user.accessToken, user.userId, lastSync, endDate);
                syncedUsers.push(user.userId);
            } catch (error) {
                console.error(`User ${user.userId} sync failed:`, error);
            }
        });

        await Promise.all(promises);

        if (!syncedUsers.length) {
            return 'Sync finished, but no users were updated.';
        }

        return `Task finished synchronization for users: ${syncedUsers.join(', ')}`;

    } catch (error) {
        console.error('User sync task failed:', error);
        return 'Task failed — check logs for details.';
    }
};

// --- Helpers ---
function isValidDate(date) {
    return date && !isNaN(new Date(date).getTime());
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