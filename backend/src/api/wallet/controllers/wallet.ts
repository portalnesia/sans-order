/**
 *  wallet controller
 */

import { factories } from '@strapi/strapi'
import { PAYMENT_STATUS, PAYMENT_TYPE, SEND_ALL_CODES } from '../../../../types/Payment';
import { Toko } from '../../../../types/Toko';
import checkTokoSubscription from '../../../utils/check-subscription';
import toko from '../../toko/controllers/toko';
import getFilter from '../../transaction/controllers/utils/get-filter';

export default factories.createCoreController('api::wallet.wallet',({strapi}) => ({
  async create(ctx) {
    try {
      const user = ctx.state?.user;
      const toko = ctx.state.toko as Toko;
      if(!user) return ctx.forbidden('You are forbidden to add outlets');

      /**
       * Check user = yang punya toko
       */
      // @ts-ignore
      const data = ctx.request?.body?.data||{};

      if(!data?.account) return ctx.badRequest('Missing "account" parameters');
      data.toko = toko.id;
      data.balance=0;

      // @ts-ignore
      ctx.request.body.data = data;

      if(toko?.user?.id != user.id) {
        return ctx.forbidden("You are forbidden to add wallet for this merchant");
      }

      const check = await strapi.entityService.count('api::wallet.wallet',{
        filters:{
          toko:{
            slug:{
              $eq: toko.slug
            }
          }
        },
        limit:1
      })
      if(check >= 1) return ctx.forbidden("You already add wallet for this merchant");

      return await super.create(ctx);
    } catch(e) {
      console.log(e)
    }
  },
  async update(ctx) {
    try {
      const toko = ctx.state.toko as Toko;
      const user = ctx.state?.user;
      if(!user) return ctx.forbidden('You are forbidden to edit stock');

      /**
       * Check user = yang punya toko
       */
      // @ts-ignore
      let data = ctx.request?.body?.data||{};

      if(!data?.account) return ctx.badRequest('Missing "account" parameters');
      data = {
        account:data.account,
      }

      // @ts-ignore
      ctx.request.body.data = data;

      if(toko?.user?.id != user.id) {
        return ctx.forbidden("You are forbidden to edit wallet for this merchant");
      }

      const result = await strapi.db.query('api::wallet.wallet').update({
        where:{
          toko:{
            slug:{
              $eq: toko.slug
            }
          }
        },
        data
      })
      console.log(result)

      const sanitizedEntity = await this.sanitizeOutput(result, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch(e) {
      console.log(e)
    }
  },
  async findOne(ctx) {
    const toko = ctx.state.toko as Toko;

    const result = await strapi.entityService.findMany('api::wallet.wallet',{
      filters:{
        toko:{
          slug:{
            $eq: toko.slug
          }
        }
      },
      limit:1,
      populate:'account'
    })
    if(result.length === 0) {
      return {data:null,meta:{}}
    }

    const sanitizedEntity = await this.sanitizeOutput(result[0], ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async history(ctx) {
    const toko = ctx.state.toko as Toko;
    const filter = getFilter(ctx);
    const {filters} = strapi.service('api::transaction.transaction').payment.getFilteredTransaction(filter);

    const {results,pagination} = await strapi.entityService.findPage('api::transaction.transaction',{
      filters:{
        $and:[
          ...filters.$and,
          {
            outlet:{
              toko:{
                slug:{
                  $eq: toko.slug
                }
              }
            }
          },{
            type:{
              $ne:'cashier'
            }
          },{
            payment:{
              $ne:PAYMENT_TYPE.COD
            }
          },{
            status:{
              $eq: PAYMENT_STATUS.PAID
            }
          }
        ]
      },
      populate:{
        outlet:'*',
        items:{
          item:'*'
        }
      },
      sort:{datetime:'desc'}
    })

    const sanitizedEntity = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedEntity,{pagination});
  },

  async withdraw(ctx) {
    const toko = ctx.state.toko as Toko;
    const bank_code = ctx.request.body?.data?.bank_code
    const account_name = ctx.request.body?.data?.account_name
    const account_number = ctx.request.body?.data?.account_number;
    const amount = ctx.request.body?.data?.amount

    if(!amount) return ctx.badRequest('Missing "amount" parameter');
    if(!bank_code) return ctx.badRequest('Missing "bank_code" parameter');
    if(!account_name) return ctx.badRequest('Missing "account_name" parameter');
    if(!account_number) return ctx.badRequest('Missing "account_number" parameter');

    if(typeof amount !== 'number') return ctx.badRequest('Invalid "amount" parameter');

    const merged = Object.keys(SEND_ALL_CODES);
    if(!merged.includes(bank_code)) return ctx.badRequest('Invalid "bank_code" parameter');

    return ctx.throw(503,"Under Maintenance")

    const wallets = await strapi.entityService.findMany('api::wallet.wallet',{
      filters:{
        toko:{
          slug:{
            $eq: toko.slug
          }
        }
      },
      limit:1,
      populate:'account'
    })
    if(wallets.length === 0) return ctx.notFound("Wallet not found");
    const wallet = wallets[0];

    
  }
}));
