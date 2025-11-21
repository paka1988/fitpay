CREATE TABLE IF NOT EXISTS rewards
(
    id      SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date    DATE         NOT NULL,
    reward  INTEGER      NOT NULL
);