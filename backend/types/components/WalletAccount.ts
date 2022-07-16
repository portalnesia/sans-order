
export interface WalletAccount {
  id: number;
  bank_code: 'BANK MANDIRI' | 'BANK BNI' | 'BANK BRI' | 'BANK BCA' | 'DANA' | 'LINKAJA' | 'SHOPEEPAY' | 'OVO' | 'GOPAY';
  account_name: string;
  account_number: string;
}
