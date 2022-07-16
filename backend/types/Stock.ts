import { Ingredient } from './Ingredient';
import { Outlet } from './Outlet';

export interface Stock {
  id: number;
  outlet?: Outlet;
  item?: Ingredient;
  price: number;
  type: 'in' | 'out';
  stocks: number;
  timestamp: Date;
}
