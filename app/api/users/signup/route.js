import { query } from "../../../../lib/db";
import bcrypt from "bcrypt";
export async function POST(request) {
  const { email, password } = await request.json();

  if (!password || !email)
    return Response.json("anything is empty", { status: 401 });
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at",
    [email, hashedPassword],
  );

  const newUserId = result[0].id;
  await query("INSERT INTO user_data (user_id) VALUES ($1)", [newUserId]);
  return Response.json(result[0]);
}
