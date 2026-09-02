import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/services/profile-service'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  const profile = await getProfile(user.id)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-medium text-ink">Profile</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="bg-card border border-hairline rounded-2xl p-6">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-hairline">
          <div className="w-14 h-14 rounded-full bg-sage flex items-center justify-center text-sage-ink font-medium">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-medium text-ink">{user.username}</p>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
        </div>

        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}