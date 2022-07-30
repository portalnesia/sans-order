import { File } from './File';
import { Wallet } from './Wallet';
import { Outlet } from './Outlet';
import { User } from './User';

export interface Toko {
  id: number;
  name: string;
  description?: string;
  slug: string;
  slogan?: string;
  block: boolean;
  user?: User;
  outlets: Outlet[];
  wallet?: Wallet;
  logo?: File;
  files: File[];
}
