export enum PAYMENT_STATUS {
  PAID="PAID",
  PENDING="PENDING",
  EXPIRED="EXPIRED",
  FAILED="FAILED",
  REFUNDED="REFUNDED"
}

export enum ORDER_STATUS {
  FINISHED="FINISHED",
  PENDING="PENDING",
  PROCESSING="PROCESSING",
  CANCELED="CANCELED"
}

export enum PAYMENT_TYPE {
  COD="COD",
  VIRTUAL_ACCOUNT="VIRTUAL_ACCOUNT",
  EWALLET="EWALLET",
  QRIS="QRIS"
}

export enum SEND_BANK_CODES {
  MANDIRI = "BANK MANDIRI",
  BNI = "BANK BNI",
  BRI = "BANK BRI",
  BCA = "BANK BCA"
}

export enum SEND_EWALLET_CODES {
  DANA='DANA',
  LINKAJA='LINKAJA',
  SHOPEEPAY='SHOPEEPAY',
  OVO='OVO',
  GOPAY='GOPAY'
}

export enum SEND_ALL_CODES {
  MANDIRI = "BANK MANDIRI",
  BNI = "BANK BNI",
  BRI = "BANK BRI",
  BCA = "BANK BCA",
  DANA='DANA',
  LINKAJA='LINKAJA',
  SHOPEEPAY='SHOPEEPAY',
  OVO='OVO',
  GOPAY='GOPAY'
}

export enum BANK_CODES {
  MANDIRI = "MANDIRI",
  BNI = "BNI",
  BRI = "BRI",
  PERMATA = "PERMATA"
}

export const BANK_CODES_VALUES = Object.values(BANK_CODES);

export enum EWALLET_CODE {
  OVO = "ID_OVO",
  DANA = "ID_DANA",
  LINKAJA = "ID_LINKAJA",
  SHOPEEPAY = "ID_SHOPEEPAY"
}

export const walletChannelCodetoEwalletCode: Record<string,EWALLET_CODE> = {
  "ID_DANA":EWALLET_CODE.DANA,
  "ID_LINKAJA":EWALLET_CODE.LINKAJA,
  "ID_SHOPEEPAY":EWALLET_CODE.SHOPEEPAY
}

export const paymentCodeName: Record<PAYMENT_TYPE,string> = {
  COD:"Cash on Delivery",
  VIRTUAL_ACCOUNT:"Bank Transfer",
  EWALLET:"E-wallet",
  QRIS:"QRIS"
}

export const sendBankCode: Record<BANK_CODES,string> = {
  MANDIRI:"BANK MANDIRI",
  BNI:"BANK BNI",
  BRI:"BANK BRI",
  PERMATA:"BANK PERMATA",
}

export type VirtualAccResults = {
  /**
   * Unique Xendit ID for the Virtual Account.
   * Use this ID for support escalation and reconciliation.
   * Can be used to link VA to Invoice using create Invoices API
   */
  id: string,
  /**
   * An ID of your choice which you provided upon request
   */
  external_id: string,
  /**
   * Your Xendit Business ID
   */
  owner_id: string,
  bank_code: BANK_CODES,
  /**
   * Prefix for the Virtual Account.
   * This is Xendit's merchant code for aggregator model or your merchant code retrieved from bank for switcher model.
   */
  merchant_code: string,
  /**
   * Complete Virtual Account number (including merchant code as prefix).
   * This is what a user will use to pay Virtual Account
   */
  account_number: string,
  /**
   * Name for the Virtual Account
   */
  name: string,
  currency: string,
  isSingleUse: boolean,
  isClosed: boolean,
  expected_amount?: number,
  suggested_amount?: number,
  /**
   * ISO8601 timestamp of Virtual Account expiration time. Timezone UTC+0
   */
  expiration_date?: string,
  description?: string,
  status: 'PENDING'|'INACTIVE'|'ACTIVE'
}



export type QrCodeResults = {
  /**
   * Unique identifier for this transaction
   */
  id: string,
  /**
   * Unique identifier specified by merchant for QR
   */
  external_id: string,
  /**
   * Amount specified in request
   */
  amount: number,
  /**
   * QR string to be rendered for display to end users.
   */
  qr_string: string,
  callback_url: string,
  /**
   * DYNAMIC or STATIC
   */
  type: 'DYNAMIC'|'STATIC',
  /**
   * ACTIVE (QR code can be paid)
   * INACTIVE (QR code has been paid for DYNAMIC QR)
   */
  status: 'ACTIVE'|'INACTIVE',
  created: string,
  updated: string,
  /**
   * User defined object with JSON properties and values passed in during charge creation.
   */
  metadata?: Record<string,any>
}

export interface ChannelProps {
  mobileNumber?: string;
  successRedirectURL?: string;
  failureRedirectURL?: string;
  cancelRedirectURL?: string;
  redeemPoints?: string;
}

export type EWalletResults = {
  /**
   * Unique identifier for charge request transaction.
   */
  id: string,
  /**
   * Business ID of the merchant
   */
  business_id: string,
  /**
   * Reference ID provided by merchant
   */
  reference_id: string,
  /**
   * Status of charge request
   */
  status:'SUCCEEDED'|'PENDING'|'FAILED'|'VOIDED'|'REFUNDED',
  currency: 'IDR'|'PHP',
  /**
   * Requested charge amount from merchant
   */
  charge_amount: number,
  capture_amount?: number,
  refunded_amount?: number,
  /**
   * Checkout method determines the payment flow used to process the transaction
   * ONE_TIME_PAYMENT is used for single guest checkouts
   */
  checkout_method:'ONE_TIME_PAYMENT'|'TOKENIZED_PAYMENT',
  channel_properties?: ChannelProps,
  channel_code: 'ID_DANA'|'ID_LINKAJA'|'ID_SHOPEEPAY'
  /**
   * Redirection actions to be taken when `is_redirect_required` returned in response is true
   */
  actions?:{
    desktop_web_checkout_url?:string|null,
    mobile_web_checkout_url?:string|null,
    mobile_deeplink_checkout_url?:string|null,
    qr_checkout_string?:string|null
  },
  /**
   * Flag which indicates whether redirection is required for end user to complete payment
   * When True, merchants should redirect the end user to the url given in the “actions” field.
   * When False, there is no need for redirection for payment process to continue
   */
  is_redirect_required: boolean,
  /**
   * Callback URL which payment notifications will be sent
   */
  callback_url: string,
  created: string,
  updated: string,

}