import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const SLUG = process.env.ADMIN_ROUTE_SLUG || 'manage';
const COOKIE_NAME = 'adm';
const COOKIE_VALUE = process.env.ADMIN_COOKIE || 'ok'; // simple shared token

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /manage/*
  if (!pathname.startsWith('/manage')) return NextResponse.next();

  // /manage/<slug>/...
  const parts = pathname.split('/').filter(Boolean); // ['manage', '<slug>', ...]
  const slug = parts[1] || '';
  if (slug !== SLUG) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Check auth cookie
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token !== COOKIE_VALUE) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin-login';
    url.searchParams.set('r', pathname); // optional return-to
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manage/:path*'],
};
