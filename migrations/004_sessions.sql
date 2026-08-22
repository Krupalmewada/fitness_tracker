-- 004_sessions.sql
-- Keeps session and token data 
-- token_hash stores a SHA-256 of the token
-- Author: Krupal | Created: 2026-08-13

BEGIN;
DROP TABLE IF EXISTS sessions CASCADE;
CREATE TABLE sessions(
    id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash    varchar(64)   NOT NULL,
    expires_at    timestamptz   NOT NULL,
    created_at    timestamptz   NOT NULL DEFAULT now(),
    last_used_at  timestamptz   ,
    user_agent    varchar(255)  ,
    ip_address    inet          ,

    CONSTRAINT sessions_token_hash_unique UNIQUE (token_hash)   
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
COMMIT;