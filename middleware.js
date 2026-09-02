import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/logged-out']

export function middleware(request) {
  const token = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // No cookie on a protected page -> send them to login.
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Already logged in -> don't show them the login form.
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Static assets must be excluded, or a logged-out visitor's request for
  // /illustrations/foo.png gets redirected to /login and the browser
  // receives HTML where it expected an image.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|illustrations|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
}