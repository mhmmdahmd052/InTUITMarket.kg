import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ ALLOW ALL STATIC & SYSTEM FILES
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/site.webmanifest') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  // ❌ DO NOT DO AUTH HERE
  return NextResponse.next()
}
