import { randomBytes, createHash } from "node:crypto";
import { query } from "./db";
export const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId, userAgent = null, ipAddress = null) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

    await query(
        `INSERT INTO sessions (user_id, token_hash, expires_at, user_agent, ip_address)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, tokenHash, expiresAt, userAgent, ipAddress]
    );

    return token;
}

export async function getSession(token) {
    if (!token) return null;

    const tokenHash = hashToken(token);

    const result = await query(
        `SELECT users.id, users.email, users.username, users.email_verified
         FROM sessions
         JOIN users ON users.id = sessions.user_id
         WHERE sessions.token_hash = $1
           AND sessions.expires_at > NOW()`,
        [tokenHash]
    );

    if (result.length === 0) return null;

    await query(
        `UPDATE sessions
         SET last_used_at = NOW()
         WHERE token_hash = $1`,
        [tokenHash]
    );

    return result[0];
}

export async function deleteSession(token) {
    if (!token) return;

    const tokenHash = hashToken(token);

    await query(
        `DELETE FROM sessions
         WHERE token_hash = $1`,
        [tokenHash]
    );
}