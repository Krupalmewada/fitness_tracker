import Image from 'next/image'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Hidden below lg - a marketing panel isn't worth half a phone screen. */}
      <div className="hidden lg:block relative bg-butter">
        {/* object-cover fills the panel edge to edge, cropping rather than
            letterboxing. The scrim below keeps the white text readable. */}
        <Image
          src="/illustrations/meditation-yoga.jpg"
          alt=""
          fill
          priority
          unoptimized
          sizes="(max-width: 1024px) 0px, 50vw"
          className="object-cover object-bottom"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-12">
          <h2 className="text-3xl font-medium text-white leading-tight max-w-sm">
            Welcome back to your wellness journey
          </h2>
          <p className="text-sm text-white/75 mt-3 max-w-sm leading-relaxed">
            Log your workouts, track your weight, and see your nutrition come
            together in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-col p-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center">
                <span className="text-sage-ink text-sm font-medium">V</span>
              </div>
              <div>
                <p className="text-xl font-medium text-ink leading-tight">VitalPath</p>
                <p className="text-xs text-zinc-500">Fitness tracker</p>
              </div>
            </div>

            {children}
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} VitalPath
        </p>
      </div>
    </div>
  )
}