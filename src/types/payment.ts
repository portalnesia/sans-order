import type {FullColor} from './general'
export const statusType = ['PAID','PENDING','EXPIRED','FAILED','REFUNDED'] as ('PAID'|'PENDING'|'EXPIRED'|'FAILED'|'REFUNDED')[];

export const orderStatusType = ['FINISHED','PENDING','PROCESSING','CANCELED'] as ('FINISHED'|'PENDING'|'PROCESSING'|'CANCELED')[];

export const paymentType = ['COD','VIRTUAL_ACCOUNT','EWALLET','QRIS'] as ('COD'|'VIRTUAL_ACCOUNT'|'EWALLET'|'QRIS')[];

export type IPayment = typeof paymentType[number];
export type IStatus = typeof statusType[number];
export type IOrderStatus = typeof orderStatusType[number]

export const sendBankCode = {
  MANDIRI:"BANK MANDIRI",
  BNI:"BANK BNI",
  BRI:"BANK BRI",
  BCA:"BANK BCA",
}

export const sendBankCodeArray = Object.keys(sendBankCode);

export const sendEwalletCode = {
  DATA:'DANA',
  LINKAJA: 'LINKAJA',
  SHOPEEPAY: 'SHOPEEPAY',
  OVO: 'OVO',
  GOPAY: 'GOPAY'
}

export const sendAllCode = {...sendBankCode,...sendEwalletCode}
export const sendAllCodeArray = Object.entries(sendAllCode);

export const colorStatus: Record<IStatus,FullColor> = {
  PAID:'primary',
  PENDING:'warning',
  EXPIRED:'default',
  FAILED:'error',
  REFUNDED:'default'
}

export const colorOrderStatus: Record<IOrderStatus,FullColor> = {
  FINISHED:'primary',
  PENDING:'error',
  PROCESSING:'warning',
  CANCELED:'default'
}