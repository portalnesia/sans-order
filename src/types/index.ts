export type ValueOf<T> = T[keyof T];

export type Without<T,K> = {
  [L in Exclude<keyof T,K>]: T[L]
}

export type CopyPartial<Base,WhichPartial extends keyof Base> = Omit<Base,WhichPartial> & Partial<Base>

export type CopyRequired<Base,WhichRequired extends keyof Base> = Base & ({[WhichRequired in keyof Base]-?: Base[WhichRequired]})