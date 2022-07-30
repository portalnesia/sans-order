import { Outlet } from './Outlet';
import { Transaction } from './Transaction';
import { Product } from './Product';

export interface TransactionItem {
  id: number;
  item?: Product;
  qty: number;
  hpp: number;
  datetime: Date;
  price: number;
  done: boolean;
  discount: number;
  metadata?: any;
  notes?: string;
  transaction?: Transaction;
  outlet?: Outlet;
}
