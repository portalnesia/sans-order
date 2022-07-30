/**
 * wallet service.
 */
import type { Strapi } from '@strapi/strapi';
import { factories } from '@strapi/strapi';

export type WalletService = ReturnType<typeof services>

const services = ({strapi}:{strapi: Strapi}) => ({
  async updateMoney(toko_id: string|number,type:'add'|'sub',money: number) {
    const wallet = await strapi.entityService.findMany('api::wallet.wallet',{
      filters:{
        toko:{
          id:{
            $eq: toko_id
          }
        }
      }
    })
    if(wallet) {
      let balance: number;
      if(type === 'add') {
        balance = wallet[0].balance + money;
      } else {
        balance = wallet[0].balance - money;
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