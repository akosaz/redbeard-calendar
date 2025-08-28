'use client';

type Lang = 'en' | 'it';

export default function LanguageSwitcher({
  value,
  onChange
}: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange('en')}
        className={`px-2 py-1 rounded-md border text-sm ${value === 'en' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100'}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => onChange('it')}
        className={`px-2 py-1 rounded-md border text-sm ${value === 'it' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100'}`}
        aria-label="Passa a Italiano"
      >
        IT
      </button>
    </div>
  );
}