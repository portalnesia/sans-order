import { SEND_ALL_CODES } from "@type/Payment";

export interface WalletAccount {
  id: number;
  bank_code: SEND_ALL_CODES;
  account_name: string;
  account_number: string;
}
