import PublicCalendar from "@/components/PublicCalendar";

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* You can add a server-rendered header here if you want */}
      <PublicCalendar />
    </main>
  );
}