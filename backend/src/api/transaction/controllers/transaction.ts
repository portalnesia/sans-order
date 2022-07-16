/**
 *  transaction controller
 */

import { factories } from '@strapi/strapi'
import { Transaction } from '../../../../types/Transaction';
import createTransaction, { payTransactionByCahier } from './utils/create-transaction';
import checkTokoSubscription from '../../../utils/check-subscription';
import { sanitisizedPopulate } from '../../../utils/ctx';
import print, { generateReportToken, report } from './utils/print';
import find from './utils/find';
import { getPendingTransaction, updateTransactionOrderStatus } from './utils/cashier';
import { getKitchenTransaction, updateTransactionKitchen } from './utils/kitchen';
import simulatePayment from './utils/simulate';

export default factories.createCoreController('api::transaction.transaction',({strapi}) => ({
  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      const {id} = ctx.params;

      const populate = sanitisizedPopulate(ctx);
      populate.outlet = {
        populate:{
          toko:{
            populate:'logo'
          }
        }
      }
      populate.user = '*'
      populate.items = {
        populate:'item'
      }

      ctx.query = {
        ...(ctx.query||{}),
        filters:{
          ...(ctx.query?.filters||{}),
          uid: {
            $eq: id
          }
        },
        populate
      }
      
      const dt = await strapi.entityService.findMany<'api::transaction.transaction',Transaction>('api::transaction.transaction',ctx?.query);

      if(dt.length === 0) return ctx.notFound();

      const d = dt?.[0];

      if(d.type == 'withdraw' && !user) return ctx.notFound();

      const token = await strapi.plugins['users-permissions'].services.jwt.issue({id:d.id,outlet_id:d.outlet?.id},{expiresIn:'15m'})
      const {name,email,telephone,user:dUser,...rest} = d;
      
      const data = {
        ...rest,
        user: dUser ? {
          name: dUser.name,
          email: dUser.email,
          telephone: dUser.telephone
        } : {
          name,
          email,
          telephone
        },
        token
      }

      return this.transformResponse(data);
    } catch(e) {
      console.log(e)
      throw e
    }
  },
  async delete(ctx) {
    const user = ctx.state?.user;
    const outlet = ctx.state.outlet;
    const {id} = ctx.params;

    if(!user || !outlet) return ctx.forbidden();

    if(outlet?.toko?.user?.id != user.id) {
      const users = outlet?.users?.find(u=>u?.user?.id == user.id && !u.pending && u.roles.find(r=>r.name === 'Transaction') !== undefined);
      if(!users) return ctx.forbidden("You are forbidden to delete this ingredient");
    }
    
    const subs = await checkTokoSubscription(strapi,outlet?.toko?.user);
    if(!subs) return ctx.notFound();

    return await strapi.service('api::transaction.transaction').delete(id,ctx.query)
  },
  find(ctx) {
    return find.apply(this,[strapi,ctx])
  },
  create(ctx) {
    return createTransaction.apply(this,[strapi,ctx])
  },
  print(ctx) {
    return print.apply(this,[strapi,ctx])
  },
  getPending(ctx) {
    return getPendingTransaction.apply(this,[strapi,ctx])
  },
  getKitchen(ctx) {
    return getKitchenTransaction.apply(this,[strapi,ctx])
  },
  updateTransactionOrderStatus(ctx) {
    return updateTransactionOrderStatus.apply(this,[strapi,ctx])
  },
  updateTransactionKitchen(ctx) {
    return updateTransactionKitchen.apply(this,[strapi,ctx])
  },
  simulatePayment(ctx) {
    return simulatePayment.apply(this,[strapi,ctx])
  },
  report(ctx) {
    return report.apply(this,[strapi,ctx])
  },
  generateReportToken(ctx) {
    return generateReportToken.apply(this,[strapi,ctx])
  },
  payTransaction(ctx) {
    return payTransactionByCahier.apply(this,[strapi,ctx])
  }
}));
