import { Promo } from './Promo';
import { Recipes } from './components/Recipes';
import { File } from './File';
import { Outlet } from './Outlet';

export interface Product {
  id: number;
  name: string;
  outlet?: Outlet;
  description?: string;
  price: number;
  hpp?: number;
  image?: File;
  active: boolean;
  category?: string;
  show_in_menu: boolean;
  block: boolean;
  metadata?: any;
  recipes: Recipes[];
  promo?: Promo;
}
