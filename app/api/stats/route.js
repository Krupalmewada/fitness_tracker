import { query } from "@/lib/db";

export async function GET(request) {
  const userId = request.nextUrl.searchParams.get("userId");
  
  if (!userId)
    return Response.json({ error: "userId required" }, { status: 400 });

  const workoutCalories = await query(
    "SELECT SUM(calories) as total FROM workouts WHERE user_id=$1",
    [userId]
  );
  const foodCalories = await query(
    "SELECT SUM(calories) as total FROM food_intake WHERE user_id=$1",
    [userId]
  );
  const latestWeight = await query(
    "SELECT weight FROM weight_entries WHERE user_id=$1 ORDER BY date DESC LIMIT 1",
    [userId]
  );
  const userGoal = await query(
    "SELECT weight_loss_goal FROM user_data WHERE user_id=$1",
    [userId]
  );

  const workout = workoutCalories[0]?.total || 0;
  const food = foodCalories[0]?.total || 0;

  return Response.json({
    workoutCalories: workout,
    foodCalories: food,
    netCalories: food - workout,
    currentWeight: latestWeight[0]?.weight,
    weightGoal: userGoal[0]?.weight_loss_goal,
  });
}