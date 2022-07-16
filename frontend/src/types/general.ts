import { StrapiResponse } from '@portalnesia/portalnesia-strapi';
import {Redirect} from 'next'
import { SSRConfig } from 'next-i18next';
import { ORDER_STATUS, PAYMENT_STATUS } from './Payment';

export type ValueOf<T> = T[keyof T];

export type Without<T,K> = {
  [L in Exclude<keyof T,K>]: T[L]
}

export type CopyPartial<Base,WhichPartial extends keyof Base> = Omit<Base,WhichPartial> & Partial<Base>

export type CopyRequired<Base,WhichRequired extends keyof Base> = Base & ({[WhichRequired in keyof Base]-?: Base[WhichRequired]})

type IChangeToID<D,P extends keyof D> = {
  [L in P]?: number|string|null
}

export type Nullable<D> = {
  [L in keyof D]?: D[L]|null
}

export type CreateParams<D,P extends keyof D> = {
  [L in Exclude<keyof D,P>]?: D[L]|null
} & IChangeToID<D,P>

export type IPages<D,Pagination extends boolean = false> = {
  meta?: StrapiResponse<D,Pagination>,
  err?: number
} & Partial<SSRConfig>

export type Color = 'primary'|'secondary'|'info'|'success'|'warning'|'error';
export type FullColor = Color | 'default'

export const colorStatus: Record<PAYMENT_STATUS,FullColor> = {
  PAID:'primary',
  PENDING:'warning',
  EXPIRED:'default',
  FAILED:'error',
  REFUNDED:'default'
}

export const colorOrderStatus: Record<ORDER_STATUS,FullColor> = {
  FINISHED:'primary',
  PENDING:'error',
  PROCESSING:'warning',
  CANCELED:'default'
}