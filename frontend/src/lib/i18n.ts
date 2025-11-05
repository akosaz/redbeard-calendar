export type Lang = 'en' | 'it';

export const resources: Record<Lang, Record<string, string>> = {
  en: {
    business_name: 'Pasticceria Barbarossa',
    title: 'Orders Availability',
    edit: 'Edit',
    done: 'Done',
    available: 'Available',
    available_desc: 'Open for new orders',
    limited: 'LIMITED',
    limited_desc: 'This day is nearly full, hurry up!',
    finished: 'SOLD OUT',
    finished_desc: 'Unfortunately this day is completely booked  :(',
    enter_pw: 'Enter Admin Password',
    password: 'Password',
    confirm: 'Confirm',
    cancel: 'Cancel',
    prev: 'Previous month',
    next: 'Next month',
    loading: 'Loading...'
  },
  it: {
    business_name: 'Pasticceria Barbarossa',
    title: 'Disponibilità Ordini',
    edit: 'Modifica',
    done: 'Fine',
    available: 'Disponibile',
    available_desc: 'Aperto a nuovi ordini',
    limited: 'IN ESAURIMENTO',
    limited_desc: 'Questa data si sta riempiendo, prenotala per non perdere la disponibilità!',
    finished: 'SOLD OUT',
    finished_desc: 'Purtroppo questa data è piena  :(',
    enter_pw: 'Inserisci password admin',
    password: 'Password',
    confirm: 'Conferma',
    cancel: 'Annulla',
    prev: 'Mese precedente',
    next: 'Mese successivo',
    loading: 'Caricamento...'
  }
};

export function t(lang: Lang, key: string) {
  return resources[lang]?.[key] ?? key;
}
