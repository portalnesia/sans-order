import { Promo } from './Promo';
import { Ingredient } from './Ingredient';
import { Product } from './Product';
import { File } from './File';
import { Toko } from './Toko';
import { OutletUsers } from './OutletUsers';
import { BusinessHour } from './components/BusinessHour';

export type IDays = 'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday'
export const daysArray = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as IDays[]

export type IUserAccess = 'Product'|'Transaction'|'Outlet'|'User'|'Stock'|'Promo'|'Kitchen'|'Ingredient'
export const userAccess = ['Product','Transaction','Outlet','User','Stock','Promo','Kitchen','Ingredient'] as IUserAccess[]

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
  users: OutletUsers[];
  toko?: Toko;
  files: File[];
  products: Product[];
  idcounter: number;
  ingredients: Ingredient[];
  promos: Promo[];
  business_hour: BusinessHour[];
}