import { randomBytes, createHash } from "node:crypto";
import { query } from "./db";
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export async function createSession(userId, userAgen=null, ipAddress=null){
    const token = randomBytes.toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex')
}