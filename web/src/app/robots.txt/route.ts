export function GET() {
    const body = `User-agent: *\nDisallow: /manage/\n`;
    return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}