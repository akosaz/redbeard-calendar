// app/api/admin/login/route.ts
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: string } | null;
  if ((body?.password || '') !== (process.env.ADMIN_PASSWORD || '')) {
    return new Response('Unauthorized', { status: 401 });
  }
  const slug = process.env.ADMIN_ROUTE_SLUG || 'manage';
  const cookieValue = process.env.ADMIN_COOKIE || 'ok';

  return new Response(slug, {
    headers: {
      'Set-Cookie': [
        `adm=${cookieValue}`,
        'Path=/manage',           // cookie only valid under /manage
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=2592000',        // 30 days
        process.env.NODE_ENV === 'production' ? 'Secure' : '',
      ].filter(Boolean).join('; ')
    }
  });
}
