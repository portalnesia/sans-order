import { Dayjs } from "dayjs";

export interface BusinessHour {
  id: number;
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  from: Date;
  to: Date;
}

export interface BusinessHourCreate {
  id?: number
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  from: Dayjs;
  to: Dayjs;
}
