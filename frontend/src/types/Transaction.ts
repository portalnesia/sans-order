import { TransactionItem } from './TransactionItem';
import { User } from './User';
import { Outlet } from './Outlet';

export interface Transaction<M=any,D=any> {
  id: number;
  outlet?: Outlet;
  user?: {
    name?: string;
    email?: string;
    telephone?: string;
  };
  uid: string;
  payment: 'COD' | 'VIRTUAL_ACCOUNT' | 'EWALLET' | 'QRIS' | 'BANK MANDIRI' | 'BANK BNI' | 'BANK BRI' | 'BANK BCA' | 'DANA' | 'LINKAJA' | 'SHOPEEPAY' | 'OVO' | 'GOPAY';
  status: 'PAID' | 'PENDING' | 'EXPIRED' | 'FAILED' | 'REFUNDED';
  order_status: 'FINISHED' | 'PENDING' | 'PROCESSING' | 'CANCELED';
  subtotal: number;
  disscount: number;
  total: number;
  cash: number;
  platform_fees: number;
  datetime?: Date;
  updated?: Date;
  expired?: Date;
  type: 'self_order' | 'cashier' | 'withdraw';
  cashier?: User;
  payload?: D;
  metadata?: M;
  items: TransactionItem[];
  token?: string
}
