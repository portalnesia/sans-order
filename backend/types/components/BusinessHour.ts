
export interface BusinessHour {
  id: number;
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  from: Date;
  to: Date;
}
