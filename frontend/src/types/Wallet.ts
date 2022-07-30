import { WalletAccount } from './components/WalletAccount';
import { Toko } from './Toko';

export interface Wallet {
  id: number;
  toko?: Toko;
  balance: number;
  account: WalletAccount;
}
