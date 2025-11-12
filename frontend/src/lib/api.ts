/**
 * API utility for interacting with the backend.
 * Uses NEXT_PUBLIC_API_URL environment variable for flexible deployment.
 */

export type DayStatus = 'available' | 'limited' | 'finished';
export type DaysMap = Record<string, DayStatus>;
export type MonthAvailabilityResponse = { days: DaysMap };

const getApiUrl = (): string => {
  // Use environment variable set during deployment
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback for local development
  return 'http://localhost:8080';
};

export const apiUrl = getApiUrl();

/**
 * Get availability data for a specific month
 */
export async function getAvailability(year: number, month: number) {
  const response = await fetch(
    `${apiUrl}/api/availability?year=${year}&month=${month}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch availability');
  }

  return response.json();
}

/**
 * Update status for a specific day
 */
export async function updateDayStatus(
  date: string,
  status: 'available' | 'limited' | 'finished',
  password: string
) {
  const response = await fetch(`${apiUrl}/api/availability`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, status, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to update status');
  }

  return response;
}
