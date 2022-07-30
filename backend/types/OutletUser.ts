import { Outlet } from './Outlet';
import { User } from './User';
import { OutletUserRole } from './OutletUserRole';

export interface OutletUser {
  id: number;
  pending: boolean;
  roles: OutletUserRole[];
  user?: User;
  outlet?: Outlet;
}
