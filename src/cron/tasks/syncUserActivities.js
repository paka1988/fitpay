const {findAllUsers} = require('../../services/userService')
const {syncRewardsFromRange} = require('../../services/rewardService')
const {getAPIRequestLimit} = require('../../services/fitbitService')

exports.task = (ctx) => {

    const syncedUsers = [];

    findAllUsers().then(users => {

        if (!users?.length) {
            console.error('No users found');
        }
        let today = new Date().toISOString().split('T')[0];
        users.forEach(user => {

            let lastSync = user.lastSync || user.memberSince;
            if (!lastSync || isNaN(new Date(lastSync).getTime())) {
                console.error(`Invalid date for lastSync or memberSince: ${lastSync}`);
                return;
            }
            let days = calculateDays(lastSync, today)
            if (days < getAPIRequestLimit()) {
                syncRewardsFromRange(user.accessToken, user.userId, user.lastSync, today)
                    .catch(err => {
                        console.error('Failed to sync user: ' + user.userId, err);
                    })
                syncedUsers.push(user)
            } else {
                let lastSyncDate = new Date(user.lastSync);
                let lastSyncPlusRequestLimit = new Date(lastSyncDate);
                lastSyncPlusRequestLimit.setDate(lastSyncDate.getDate() + getAPIRequestLimit());
                syncRewardsFromRange(user.accessToken, user.userId, user.lastSync, lastSyncPlusRequestLimit)
                    .catch(err => {
                        console.error('Failed to sync user: ' + user.userId, err);
                    })
                syncedUsers.push(user)
            }
        })
    }).catch(error => {
        console.error('Failed to fetch users:', error);
    });

    const usersSynced = syncedUsers.map(user => user.userId).join(',');

    return 'Task finished synchronization for users: ' + usersSynced;
};

function calculateDays(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let timeDifference = end - start;
    return timeDifference / (1000 * 3600 * 24);
}