class User {
    static PLATFORM_NAME = "Fitbit"; // Extracted constant for "Fitbit" platform reference

    constructor({userId = null, accessToken = null, refreshToken = null, tokenExpiresAt = null, memberSince = null, lastSync = null}) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : null;
        this.memberSince = memberSince;
        this.lastSync = lastSync;
    }
}

module.exports = User;
