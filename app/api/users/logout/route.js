import { destroySession } from "@/lib/auth";

export async function POST() {
    try {
        await destroySession();

        return Response.json(
            { message: "Logged out successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Logout error:", error);

        return Response.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}