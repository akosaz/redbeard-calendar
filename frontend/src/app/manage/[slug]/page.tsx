'use client';

import CalendarBase from "@/components/CalendarBase";

// Editable view; middleware already gated access
export default function ManagePage() {
  return (
    <main className="min-h-screen">
      <CalendarBase isAdmin={true} />
    </main>
  );
}