import { Product } from '../Product';

export interface TrItems {
  id: number;
  hpp: number;
  qty: number;
  done: boolean;
  price: number;
  disscount: number;
  metadata?: any;
  item?: Product;
  notes?: string;
}
