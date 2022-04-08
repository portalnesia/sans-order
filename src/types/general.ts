import {Redirect} from 'next'

export type ValueOf<T> = T[keyof T];

export type Without<T,K> = {
  [L in Exclude<keyof T,K>]: T[L]
}

export type CopyPartial<Base,WhichPartial extends keyof Base> = Omit<Base,WhichPartial> & Partial<Base>

export type CopyRequired<Base,WhichRequired extends keyof Base> = Base & ({[WhichRequired in keyof Base]-?: Base[WhichRequired]})

export type IDate = {
  format:string,
  timestamp: number
}
export type ISeen = {
  number: number,
  format: string
}

export type IPages = {
  meta?: {
    title?: string,
    description?: string,
    slug?: string,
    toko_name?: string,
  },
  err?: number
}

export type Color = 'primary'|'secondary'|'info'|'success'|'warning'|'error';
export type FullColor = Color | 'default'