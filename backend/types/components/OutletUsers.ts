import { User } from '../User';
import { OutletUserRole } from '../OutletUserRole';

export interface OutletUsers {
  id: number;
  pending: boolean;
  roles: OutletUserRole[];
  user?: User;
}
