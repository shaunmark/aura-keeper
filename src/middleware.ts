import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')

  if (!session && (request.nextUrl.pathname.startsWith('/leaderboard') || 
                   request.nextUrl.pathname.startsWith('/setup-username'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/leaderboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/leaderboard/:path*', '/login', '/setup-username']
} 