import { query } from "../../../lib/db";
export async function POST(request) {
  const { user_id, food, calories, date } = await request.json();
  if (!user_id)
    return Response.json({ error: "user not found" }, { status: 404 });
  const result = await query(
    "INSERT INTO food_intake  (user_id, food, calories, date) VALUES ($1, $2,$3 ,$4) RETURNING *",
    [user_id, food, calories, date],
  );
  return Response.json(result[0]);
}
export async function GET(request) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId)
    return Response.json({ error: "user not found" }, { status: 404 });

  const result = await query("SELECT * FROM food_intake WHERE user_id=$1", [
    userId,
  ]);
  if (result.length === 0)
    return Response.json(
      { error: "user has not entered food" },
      { status: 404 },
    );
  return Response.json(result);
}
