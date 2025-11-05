'use client';

export default function AdminLogin() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        className="w-full max-w-sm space-y-3 border rounded-2xl p-4 bg-white"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const pw = String(fd.get('pw') || '').trim();
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pw }),
          });
          if (res.ok) {
            const slug = await res.text();
            location.href = `/manage/${slug}`;
          } else {
            alert('Wrong password');
          }
        }}
      >
        <div className="text-lg font-semibold">Admin sign in</div>
        <input name="pw" type="password" className="w-full border rounded-lg px-3 py-2" placeholder="Password" />
        <button className="w-full px-3 py-2 rounded-lg bg-gray-900 text-white">Sign in</button>
      </form>
    </main>
  );
}
