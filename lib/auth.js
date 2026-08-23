import { cookies } from "next/headers";
import {
    SESSION_LIFETIME_MS,
    getSession,
    deleteSession
} from "./session";

const SESSION_COOKIE_NAME = "session";

export function getRequestMetadata(request) {
    const userAgent = request.headers.get("user-agent");

    const forwardedFor = request.headers.get("x-forwarded-for");

    const ip = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : null;

    return { userAgent, ip };
}

export async function setSessionCookie(token) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_LIFETIME_MS / 1000,
    });
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();

    cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    return await getSession(token);
}

export async function destroySession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
        await deleteSession(token);
    }

    await clearSessionCookie();
}