import { Outlet } from './Outlet';

export interface Ingredient {
  id: number;
  outlet?: Outlet;
  name: string;
  description?: string;
  unit: string;
  stock?: number;
}
