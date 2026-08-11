export async function POST(request){
    const { user_id, weight, date, notes } = await request.json()
    if(!user_id) return Response.json({ error: "user not found" }, { status: 404 })
    const result = await query('INSERT INTO weight_entries (user_id, weight, date, notes) VALUES ($1, $2,$3 ,$4) RETURNING weight, date',[user_id, weight, date, notes])
    return Response.json(result)
}
export async function GET(request){
    const userId = request.nextUrl.searchParams.get('userId')
    if(!userid) return Response.json({ error: "user not found" }, { status: 404 })
    
    const result = await query('SELECT * FROM weight_entries WHERE user_id=$1',[userId])
    if(result.length === 0) return Response.json({ error: "user has not entered weight" }, { status: 404 })
    return Response.json(result)
}