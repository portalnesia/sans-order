import { OutletUser } from './OutletUser';
import { BusinessHour } from './components/BusinessHour';
import { Promo } from './Promo';
import { Ingredient } from './Ingredient';
import { Product } from './Product';
import { File } from './File';
import { Toko } from './Toko';

export interface Outlet {
  id: number;
  name: string;
  description?: string;
  address?: string;
  busy: boolean;
  self_order: boolean;
  online_payment: boolean;
  cod: boolean;
  table_number: boolean;
  block: boolean;
  toko?: Toko;
  files: File[];
  products: Product[];
  idcounter: number;
  ingredients: Ingredient[];
  promos: Promo[];
  business_hour: BusinessHour[];
  users: OutletUser[];
}
