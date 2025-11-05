export type DayStatus = "available" | "limited" | "finished";

export interface DayAvailability {
  date: string;
  status: DayStatus;
}

export interface MonthAvailabilityRequest {
  year: number;
  month: number;
}

export interface MonthAvailabilityResponse {
  days: Record<string, DayStatus>;
}

export interface UpdateDayRequest {
  date: string;
  status: DayStatus;
  password: string;
}
