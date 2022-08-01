import { Ingredient } from './Ingredient';
import { Outlet } from './Outlet';
import { Product } from './Product';
import { Transaction } from './Transaction';

export interface Stock {
  id: number;
  outlet?: Outlet;
  item?: Ingredient;
  price: number;
  type: 'in' | 'out';
  stocks: number;
  timestamp: Date;
  transaction?: Transaction;
  product?: Product
}
