/**
 * wallet service.
 */
import type { Strapi } from '@strapi/strapi';
import { factories } from '@strapi/strapi';

export type WalletService = ReturnType<typeof services>

const services = ({strapi}:{strapi: Strapi}) => ({
  async updateMoney(toko_id: string|number,type:'add'|'sub',money: any) {
    const wallet = await strapi.entityService.findMany('api::wallet.wallet',{
      filters:{
        toko:{
          id:{
            $eq: toko_id
          }
        }
      }
    })
    const uang = Number(money);
    if(wallet) {
      let balance: number;
      if(type === 'add') {
        balance = Number(wallet[0].balance) + uang;
      } else {
        balance = Number(wallet[0].balance) - uang;
      }

      return await strapi.entityService.update('api::wallet.wallet',wallet[0].id,{
        data:{
          balance
        }
      })
    }
    return false;
  }
})

export default factories.createCoreService('api::wallet.wallet',services);;