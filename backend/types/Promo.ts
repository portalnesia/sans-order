import { Outlet } from './Outlet';
import { Product } from './Product';
import { File } from './File';

export interface Promo {
  id: number;
  name: string;
  description?: string;
  image?: File;
  from: Date;
  to: Date;
  active: boolean;
  products: Product[];
  type: 'fixed' | 'percentage';
  amount: number;
  outlet?: Outlet;
}
