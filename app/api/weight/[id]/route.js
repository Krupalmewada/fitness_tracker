import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { id } = await params

    // Ownership lives in the WHERE clause. A wrong user matches zero rows,
    // so there is no separate check to forget and no race between the two.
    const deleted = await query(
      `DELETE FROM weight_entries WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, user.id]
    )

    if (deleted.length === 0) {
      return Response.json({ error: 'Entry not found.' }, { status: 404 })
    }

    // 204 No Content: it worked, there is nothing to send back.
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error.code === '22P02') {
      return Response.json({ error: 'Invalid id.' }, { status: 400 })
    }
    console.error('Weight DELETE error:', error)
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}