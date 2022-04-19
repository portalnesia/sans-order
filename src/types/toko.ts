import { IPayment,IStatus,IOrderStatus } from "./payment"
import { UserPagination } from "./user"

<<<<<<< HEAD
export type IDay = 'sunday'|'monday'|'tuesday'|'wednesday'|'thursday'|'friday'|'saturday';
export const daysArray = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as IDay[]

=======
>>>>>>> main
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
  isAdmin: boolean,
  isOwner: boolean,
  isMyToko: boolean,
  wallet?: boolean,
  table_number: boolean,
  token_download_qr?: string,
  owner?: UserPagination,
<<<<<<< HEAD
  busy: boolean,
  business_hour: Record<Partial<IDay>,[number,number]>|null
=======
>>>>>>> main
  toko:{
      id: number,
      name: string,
      description: string|null,
      slug: string,
      logo: string|null,
      slogan: string|null
  }
}

export type IProduct<D=any> = {
  id: number,
  toko_id: number,
  outlet_id: number,
  name: string,
  description: string|null,
  price: number,
  disscount: number,
  image: string|null,
  active: boolean,
  category: string|null,
  hpp: number|null,
  stock: number|null,
  stock_per_items?: number|null,
  unit: string|null,
  show_in_menu: boolean,
  metadata: D|null
}

export type IItems<D=any> = {
  id: number,
  qty: number,
  name: string,
  price: number,
  disscount: number,
  metadata: D|null,
  hpp?: number|null,
  remaining_stock?: number|null
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
<<<<<<< HEAD
  user?: (UserPagination|{name: string}) & ({email?: string})
=======
  user?: UserPagination|{name: string}
>>>>>>> main
  payload: Record<string,any>|null
  platform_fees: number,
  metadata: D|null,
  cashier?: string,
  type:'self_order'|'cashier',
  token_print?: string
}

<<<<<<< HEAD
export interface WalletHistory<D=any> extends ITransaction<D> {
  toko: IToko | ({
    id: number,
    name: string
    address: string|null,
    description: string|null,
    toko?:IToko
  })
}
=======
>>>>>>> main

export interface TransactionsDetail<D=any> extends ITransaction<D> {
  toko:IOutlet
}

export interface TokoUsers {
  id: number,
  name: string,
  username: string,
  picture: string|null,
  admin: boolean,
  owner:boolean,
  pending: boolean
}

export interface IMenu {
  category: string,
  data: IProduct[]
}