'use client';

import React from "react";
import Image from "next/image";
import { useI18n } from "@/app/i18n-provider";
import LanguageSwitcher from "./LanguageSwitcher";
import { t } from "@/lib/i18n";
import { getAvailability, updateDayStatus, type DayStatus, type DaysMap, type MonthAvailabilityResponse } from "@/lib/api";

export default function CalendarBase({ isAdmin }: { isAdmin: boolean }) {

  const { lang, setLang } = useI18n();

  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1); // 1-12
  const [days, setDays] = React.useState<DaysMap>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;
    setLoading(true);
    getAvailability(year, month)
      .then((data: MonthAvailabilityResponse) => {
        if (!ignore) setDays(data.days || {});
        setError(null);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
    return () => { ignore = true; };
  }, [year, month]);

  function monthNameUTC(y: number, m: number) {
    // lock to UTC so SSR/client match
    const fmt = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' });

    const out = fmt.format(new Date(Date.UTC(y, m - 1, 1)));

    return out.charAt(0).toUpperCase() + out.slice(1);
  }

  function daysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate(); }
  function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
  function key(y: number, m: number, d: number) { return `${y}-${pad(m)}-${pad(d)}`; }
  function weekdayIndex(y: number, m: number, d: number) {
    // Monday=0 ... Sunday=6
    const js = new Date(y, m - 1, d).getDay(); // 0=Sun
    return (js + 6) % 7;
  }

  function prevMonth() {
    const dt = new Date(year, month - 2, 1);
    setYear(dt.getFullYear());
    setMonth(dt.getMonth() + 1);
  }

  function nextMonth() {
    const dt = new Date(year, month, 1);
    setYear(dt.getFullYear());
    setMonth(dt.getMonth() + 1);
  }

  function cycleStatus(s: DayStatus): DayStatus {
    if (s === 'available') return 'limited';
    if (s === 'limited') return 'finished';
    return 'available';
  }

  async function handleDayClick(d: number) {
    if (!isAdmin) return;
    const k = key(year, month, d);
    const next = cycleStatus(days[k] || 'available');
    const password = (typeof window !== 'undefined' && localStorage.getItem('admin_pw')) || '';

    try {
      setDays((prev: DaysMap) => ({ ...prev, [k]: next })); // optimistic
      await updateDayStatus(k, next, password);
      setError(null);
    } catch {
      setError('Update failed');
    }
  }

  function statusClasses(s: DayStatus) {
    if (s === 'limited') return 'limited text-gray-900';
    if (s === 'finished') return 'finished text-gray-900';
    return 'bg-white text-gray-900';
  }

  const totalDays = daysInMonth(year, month);
  const firstOffset = weekdayIndex(year, month, 1); // blanks before day 1

  return (
    <div className="min-h-screen bg-cover bg-center text-gray-900 flex flex-col"
      style={{ backgroundImage: "url('/bg_pink.png')" }}>
      {/* Header */}
      <header className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-white top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {isAdmin && (
            <div className="flex items-center text-3xl">
              <span className="px-3 py-2me-2">✏</span>
              <div className="font-semibold text-red-500">ADMIN</div>
            </div>
          )
          }
          <div className="font-semibold text-lg">{t(lang, 'title')}</div>
          <div className="font-semibold text-lg">{t(lang, 'business_name')}</div>

          {/* Language selector on the right */}
          <LanguageSwitcher value={lang} onChange={setLang} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 justify-center mb-5 ">
          <button onClick={prevMonth} className="px-3 py-2 rounded-full border hover:bg-gray-100" aria-label="Previous month">◀</button>
          <div className="font-medium text-2xl sm:text-3xl w-60 text-center">
            {monthNameUTC(year, month)}
          </div>
          <button onClick={nextMonth} className="px-3 py-2 rounded-full border hover:bg-gray-100" aria-label="Next month">▶</button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center">
            {loading && <div className="mb-3 text-sm text-gray-500">{t(lang, 'loading')}</div>}
            {error && <div className="mb-3 font-bold bg-amber-200 text-red-600 text-center rounded-full p-2">{t(lang, 'error_loading')}</div>}
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-2 text-base sm:text-base font-bold mb-2 select-none">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-center">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstOffset }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = i + 1;
              const k = key(year, month, d);
              const s = days[k] || 'available';
              return (
                <button
                  key={k}
                  onClick={() => handleDayClick(d)}
                  className={`aspect-square rounded-full flex items-center justify-center text-lg sm:text-2xl font-semibold select-none ${statusClasses(s)} ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                  aria-label={`Day ${d} is ${s}`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 justify-between">
            {/* <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white ring-1 ring-gray-200 block" />
              <div className="">
                <div className="font-medium">{t(lang, 'available')}</div>
                <div className="text-xs text-gray-500">{t(lang, 'available_desc')}</div>
              </div>
            </div> */}
            <div className="flex items-center gap-3">
              <span className="sm:w-16 sm:h-16  p-10 rounded-full limited block" />
              <div>
                <div className="font-bold">{t(lang, 'limited')}</div>
                <div className="text-base">{t(lang, 'limited_desc')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 h-16 p-10 rounded-full finished block" />
              <div>
                <div className="font-bold">{t(lang, 'finished')}</div>
                <div className="text-base">{t(lang, 'finished_desc')}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 bg-white">
        <div className="max-w-3xl mx-auto flex items-center justify-center">
          <Image src="/logo_b.png" alt="Logo" width={80} height={80} />
        </div>
      </footer>
    </div>
  );
}
