import { IPayment,IStatus,IOrderStatus } from "./payment"
import { UserPagination } from "./user"

export type IDay = 'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday';
export const daysArray = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as IDay[]
export type IUserAccess = 'items'|'stocks'|'outlet'|'promo'|'transactions'|'users'|'superusers';
export const userAccess = ['items','stocks','outlet','promo','transactions','users','superusers'] as IUserAccess[]

export type IToko = {
  id: number,
  name: string,
  description: string|null,
  slug: string,
  logo: string|null,
  slogan: string|null
}

export type IOutletPagination = {
  id: number,
  name: string,
  address: string,
  description: string|null,
  admin: boolean,
  toko:IToko
}

export interface IOutlet {
  id: number,
  name: string
  address: string|null,
  description: string|null,
  self_order: boolean;
  cod: boolean;
  online_payment: boolean;
  access: IUserAccess[],
  /**
   * Am i an employee in this toko/outlet?
   */
  isMyToko: boolean,
  isOwner: boolean,
  wallet?: boolean,
  table_number: boolean,
  token_download_qr?: string,
  owner?: UserPagination,
  busy: boolean,
  business_hour: Record<Partial<IDay>,[number,number]>|null
  toko:{
      id: number,
      name: string,
      description: string|null,
      slug: string,
      logo: string|null,
      slogan: string|null
  }
}

export type IStocks = {
  id: number,
  name: string,
  description: string|null,
  price: number,
  stock: number,
  unit: string,
}

export type IProduct<D=any> = {
  id: number,
  toko_id: number,
  outlet_id: number,
  name: string,
  description: string|null,
  price: number,
  image: string|null,
  active: boolean,
  category: string|null,
  disscount?: number,
  stocks: (IStocks & {consume: number})[]|null,
  show_in_menu: boolean,
  metadata: D|null
}

export type IPromo = {
  id: number,
  item_id: number,
  amount: number,
  name: string,
  description: string|null,
  image: string|null,
  show_in_menu: boolean,
  from: number,
  to: number
}

export type IItems<D=any> = {
  id: number,
  qty: number,
  name: string,
  price: number,
  disscount: number,
  metadata: D|null,
  hpp?: number|null,
}

export type ITransaction<D=any> = {
  id:string,
  subtotal: number,
  disscount: number,
  total: number,
  cash: number,
  timestamp: number,
  updated: number,
  expired: null|number,
  items: IItems[],
  payment:IPayment,
  status:IStatus,
  order_status:IOrderStatus,
  user?: (UserPagination|{name: string}) & ({email?: string})
  payload: Record<string,any>|null
  platform_fees: number,
  metadata: D|null,
  cashier?: string,
  type:'self_order'|'cashier'|'withdraw',
  token_print?: string
}

export interface WalletHistory<D=any> extends ITransaction<D> {
  toko: IToko | ({
    id: number,
    name: string
    address: string|null,
    description: string|null,
    toko?:IToko
  })
}

export interface TransactionsDetail<D=any> extends ITransaction<D> {
  toko:IOutlet
}

export interface TokoUsers {
  id: number,
  name: string,
  username: string,
  picture: string|null,
  access: IUserAccess[]
  owner: boolean
  pending:boolean
}

export interface IMenu {
  category: string,
  data: IProduct[]
}