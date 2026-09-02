import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { SidebarNav } from './sidebar-nav'
import { logoutAction } from './actions'
import { LogOut } from 'lucide-react'

export default async function AppLayout({ children }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 bg-sidebar-dark p-5 flex flex-col shrink-0">
        <div className="mb-8">
          <p className="text-white text-lg font-medium">VitalPath</p>
          <p className="text-[11px] tracking-[0.15em] text-zinc-600 uppercase mt-0.5">
            Fitness tracker
          </p>
        </div>

        <p className="text-[11px] tracking-[0.15em] text-zinc-600 uppercase mb-2 px-3">
          General
        </p>
        <SidebarNav />

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-3 px-3 pb-4 border-b border-zinc-800">
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{user.username}</p>
              <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>

          <form action={logoutAction} className="pt-3">
            <button type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-sidebar-hover hover:text-white transition-colors">
              <LogOut size={18} />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8 min-w-0">{children}</main>
    </div>
  )
}