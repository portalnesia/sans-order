import type { User } from './User'
import type { Outlet } from './Outlet';
import type { IO } from '../src/utils/socket';
import type { Toko } from './Toko';
import type { Ingredient } from './Ingredient';
import type { Product } from './Product';
import type { Stock } from './Stock';
import type { Subcribe } from './Subcribe';
import type { Transaction } from './Transaction';
import type { Wallet } from './Wallet';
import type { TransactionItem } from './TransactionItem';
import type { TrServices } from '../src/api/transaction/services/transaction';
import type { OutletUserRole } from './OutletUserRole';
import type { Promo } from './Promo';
import type { File } from './File';
import type { Params } from './General';
import { OutletUser } from './OutletUser';

declare global {
  export interface AllTypes {
    'api::outlet.outlet': Outlet
    'api::toko.toko': Toko
    'api::ingredient.ingredient': Ingredient
    'api::product.product': Product
    'api::stock.stock': Stock
    'api::subcribe.subcribe': Subcribe
    'api::transaction.transaction': Transaction
    'plugin::users-permissions.user': User
    'plugin::upload.file': File
    'api::wallet.wallet': Wallet
    'api::transaction-item.transaction-item': TransactionItem
    'api::promo.promo': Promo
    'api::outlet-user.outlet-user': OutletUser
  }
  type DefaultService = {}
  type UploadService = {
    findMany(params: Params<File>): Promise<File[]>;
    upload(data: {data: File,files:any}): Promise<File[]>
    update(id: string|number,data: Record<keyof File,any>): Promise<File>
    replace(id: string|number,data: {data: File,files:any}): Promise<File>
    remove(file: File): Promise<File>
  }
  export interface Service {
    'api::outlet.outlet': DefaultService
    'api::toko.toko': DefaultService
    'api::ingredient.ingredient': DefaultService
    'api::product.product': DefaultService
    'api::stock.stock': DefaultService
    'api::subcribe.subcribe': DefaultService
    'api::transaction.transaction': TrServices
    'plugin::users-permissions.user': DefaultService
    'api::wallet.wallet': DefaultService
    'api::transaction-item.transaction-item': DefaultService
    'api::promo.promo': DefaultService
    'plugin::upload.upload': UploadService,
    'api::outlet-user.outlet-user': DefaultService
  }
}