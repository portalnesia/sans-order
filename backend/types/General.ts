import { Outlet } from "./Outlet";

export type Without<T,K> = {
  [L in Exclude<keyof T,K>]: T[L]
}

export type CopyPartial<Base,WhichPartial extends keyof Base> = Omit<Base,WhichPartial> & Partial<Base>

export type CopyRequired<Base,WhichRequired extends keyof Base> = Base & ({[WhichRequired in keyof Base]-?: Base[WhichRequired]})

export type ValueOf<T> = T[keyof T];

type NotUnion<T> = [T] extends [infer U] ? _NotUnion<U,U> : never;
type _NotUnion<T,U> = U extends any ? ([T] extends [U] ? unknown : never) : never;

export type NestedKeys<T> = Partial<{
  [K in keyof T]: 
    T[K] extends string|number|boolean|Date ? 
      T[K] extends string & NotUnion<T[K]> ? string : T[K] 
      : string|number
}>

export type Params<T> = {
  fields?: (keyof T)[];
  filters?: any;
  _q?: string;
  populate?: any;
  sort?: any;
  start?: number;
  limit?: number;
  page?: number;
  pageSize?: number;
  publicationState?: string;
  data?: Partial<Record<keyof T,any>>;
  files?: any;
};

export type ServiceParams<T> = {
  fields?: (keyof T)[];
  filters?: any;
  _q?: string;
  populate?: any;
  sort?: any;
  pagination?:{
    start?: number;
    limit?: number;
    page?: number;
    pageSize?: number;
  }
  publicationState?: string;
  data?: Partial<Record<keyof T,any>>;
  files?: any;
};