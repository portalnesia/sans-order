import { User } from './User';

export interface Subcribe {
  id: number;
  user?: User;
  max_toko: number;
  max_outlet: number;
  max_user: number;
  expired: Date;
}
