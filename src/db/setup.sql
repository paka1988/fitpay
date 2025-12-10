DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS users;

CREATE TABLE rewards
(
    id         SERIAL PRIMARY KEY,
    user_id    VARCHAR(255)   NOT NULL,
    date       DATE           NOT NULL,
    activities INTEGER        NOT NULL,
    reward     DECIMAL(10, 2) NOT NULL DEFAULT 0,
    CONSTRAINT daily_unique UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS users
(
    id               SERIAL PRIMARY KEY,
    user_id          VARCHAR(255) UNIQUE NOT NULL, -- Fitbit user id
    access_token     TEXT,
    refresh_token    TEXT,
    token_expires_at TIMESTAMP,                    -- optional: expiry
    member_since     TIMESTAMP,
    last_sync        TIMESTAMP,
    created_at       TIMESTAMP DEFAULT now(),
    updated_at       TIMESTAMP DEFAULT now()
);