class User {
    static PLATFORM_NAME = "Fitbit"; // Extracted constant for "Fitbit" platform reference

    constructor({userId = null, accessToken = null, refreshToken = null, tokenExpiresAt = null}) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : null;
    }
}

module.exports = User;
