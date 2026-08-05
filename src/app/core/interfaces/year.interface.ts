import { Month } from './month.interface';

export interface Year {
  id: number;
  year: number;
  start_month: number;
  end_month: number;
  created_at?: string;
  months?: Month[];
}
