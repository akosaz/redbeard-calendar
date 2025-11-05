export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function isoYMD(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
