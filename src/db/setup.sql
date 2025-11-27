DROP TABLE IF EXISTS rewards;

CREATE TABLE rewards
(
    id         SERIAL PRIMARY KEY,
    user_id    VARCHAR(255)   NOT NULL,
    date       DATE           NOT NULL,
    activities INTEGER        NOT NULL,
    reward     DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP               DEFAULT NOW(),
    updated_at TIMESTAMP               DEFAULT NOW(),
    CONSTRAINT daily_unique UNIQUE (user_id, date)
);