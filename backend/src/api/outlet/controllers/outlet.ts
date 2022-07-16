/**
 *  outlet controller
 */

import { factories } from '@strapi/strapi'
import checkTokoSubscription from '../../../utils/check-subscription';
import { parseBody } from '../../../utils/parse-body';
import { isObject } from 'lodash/fp';
import { Toko } from '../../../../types/Toko';
import { Outlet } from '../../../../types/Outlet';
import { isTrue } from '@portalnesia/utils';
import getFilter from '../../transaction/controllers/utils/get-filter';
import { sanitisizedPopulate } from '../../../utils/ctx';
import { IChannelPayment } from '../../../../types/Payment';
import OutletUsersControllers from './user-utils/outlet-users';
import user from '../../../extensions/users-permissions/server/content-types/user';

export default factories.createCoreController('api::outlet.outlet',({strapi})=>{
  const usersControllers = OutletUsersControllers({strapi})
  return {
    ...usersControllers,
    async create(ctx) {
      const user = ctx.state?.user;
      if(!user) return ctx.forbidden('You are forbidden to add outlets');
  
      /**
       * Check user = yang punya toko
       */
      const data = ctx.request.body.data as Partial<Outlet>|undefined;
      if(!data) return ctx.badRequest('Missing "data" payload in the request body');
  
      
      if(!data?.toko) return ctx.badRequest('Missing "merchant" data');
      if(typeof data.online_payment !== 'undefined') return ctx.badRequest('You cannot set online payment when creating outlet');
      if(typeof data?.users !== 'undefined') return ctx.badRequest('You cannot set users when creating outlet');
  
      const toko = await strapi.entityService.findOne<'api::toko.toko',Toko>('api::toko.toko',data?.toko,{populate:'user'});
      if(!toko) return ctx.badRequest('Merchant not found');
      if(toko.user?.id != user.id) return ctx.forbidden('You are forbidden to add outlets');
  
      // Check subsription
      const subs = await checkTokoSubscription(strapi,toko.user);
      if(!subs) return ctx.notFound();
  
      /**
       * Check max outlet
       */
      const count = await strapi.db.query('api::outlet.outlet').count({
        where:{
          toko:{
            id:{
              $eq: toko.id
            }
          }
        }
      })
      if(count >= subs.max_outlet) return ctx.forbidden('You have reached the maximum limit for creating outlet',{max_outlets:subs.max_outlet});
      
      return await super.create(ctx);
    },
    async findOne(ctx) {
      const user = ctx.state.user
      const {id} = ctx.params;
      const with_wallet = isTrue(ctx.query?.with_wallet);
  
      const populate = sanitisizedPopulate(ctx);
      populate.toko = {
        populate:{
          logo:'*',
          user:'*',
          ...(with_wallet ? {wallet:{fields:['id']}} : {})
        }
      }
      populate.business_hour = '*'
      
      if(user) {
        populate.users = {
          populate:{
            user:{
              filters:{
                id:{
                  $eq: user.id
                }
              }
            }
          }
        }
      }
      
      const outlet = await strapi.entityService.findOne<'api::outlet.outlet',Outlet>('api::outlet.outlet',id,{populate})
      
      const subs = await checkTokoSubscription(strapi,outlet?.toko?.user);
      if(!subs) return ctx.notFound();
  
      const data = await strapi.entityService.findOne('api::outlet.outlet',id,{populate});
      return {data,meta:{}}
    },
    async find(ctx) {
      try {
        const user = ctx.state.user;
        if(!user) return ctx.notFound();
        const with_toko = typeof ctx.request.query?.with_toko !== 'undefined' ? isTrue(ctx.request.query?.with_toko) : false;
        
        const populate = sanitisizedPopulate(ctx);
        populate.toko = {
          populate:{
            logo:'*',
            user: '*'
          }
        }

        const filters: Record<string,any> = {
          users:{
            $and:[{
              user:{
                id:{
                  $eq: user.id
                }
              }
            },{
              pending:{
                $eq: false
              }
            }]
          }
        }
        if(!with_toko) {
          filters.toko = {
            user:{
              id:{
                $ne: user.id
              }
            }
          }
        }

        ctx.query.populate = populate;

        const {results:outlet,pagination} = await strapi.entityService.findPage<'api::outlet.outlet',Outlet>('api::outlet.outlet',{populate,filters})
        const results: Outlet[] = [];
        for(const o of outlet) {
          const subs = await checkTokoSubscription(strapi,outlet?.[0]?.toko?.user);
          if(subs) {
            results.push(o);
          }
        }

        const sanitizedEntity = await this.sanitizeOutput(results, ctx);
        return this.transformResponse(sanitizedEntity,{pagination});
      } catch(e) {
        console.log(e)
      }
    },
    async update(ctx) {
      const user = ctx.state?.user;
      const {id} = ctx.params;
      const outlet = await strapi.entityService.findOne<'api::outlet.outlet',Outlet>('api::outlet.outlet',id,{populate:{
        toko:{
          populate:{
            user:'*',
            wallet:'*'
          }
        },
        users:{
          populate:'*'
        }
      }})
      const subs = await checkTokoSubscription(strapi,outlet?.toko?.user);
      if(!subs) return ctx.notFound();
  
      const data = ctx.request.body.data as Partial<Outlet>|undefined;
      if(!data) return ctx.badRequest('Missing "data" payload in the request body');
  
      if(!user) return ctx.forbidden('You are forbidden to edit this outlet');
      if(!outlet || outlet?.toko?.user?.id != user.id) {
        const users = outlet?.users?.find(u=>u?.user?.id == user.id && !u.pending && u.roles.find(r=>r.name === 'Outlet') !== undefined);
        if(!users) return ctx.forbidden('You are forbidden to edit this outlet');
      }
  
      //if(data.users && data.users.length > subs.max_user) return ctx.forbidden('You have reached the maximum limit for adding users to this outlets',{max_users:subs.max_user});
      
      if(data.users) {
        delete ctx.request.body.data.users;
      }
  
      if(isTrue(data.online_payment)) {
        const wallet = outlet.toko?.wallet;
        if(!wallet || !wallet.account) return ctx.forbidden('You must set and activated your wallet before use "online_payment"');
      }
  
      return await super.update(ctx);
    },
    async delete(ctx) {
      const user = ctx.state?.user;
      const {id} = ctx.params;
  
      const outlet = await strapi.entityService.findOne<'api::outlet.outlet',Outlet>('api::outlet.outlet',id,{populate:{
        toko:{
          populate:{
            logo:{
              populate:'*',
              fields:['id','url']
            },
            user:'*'
          }
        }
      }})
  
      const subs = await checkTokoSubscription(strapi,outlet?.toko?.user);
      if(!subs) return ctx.notFound();
  
      if(!user) return ctx.forbidden('You are forbidden to delete this outlet');
      if(!outlet?.toko || outlet?.toko?.user?.id != user.id) return ctx.forbidden('You are forbidden to delete this outlet');
  
      await strapi.db.query('api::outlet.outlet').deleteRelations(id);
  
      return await strapi.service('api::outlet.outlet').delete(id,ctx.query);
    },
    async graph(ctx) {
      try {
        const outlet = ctx.state.outlet as Outlet;
        const user = ctx.state?.user;
        
        if(!user) return ctx.forbidden('You are forbidden to view this outlet charts');
  
        const subs = await checkTokoSubscription(strapi,outlet?.toko?.user);
        if(!subs) return ctx.notFound();
  
        const filter = getFilter(ctx);
  
        const data = await strapi.service('api::transaction.transaction').payment.getGraph(outlet,filter)
  
        return this.transformResponse(data);
      } catch(e) {
        console.log(e)
      }
    },
    async getPayment(ctx) {
      const outlet = ctx.state.outlet as Outlet;
  
      let payment: IChannelPayment[] = [];
      if(!outlet.self_order) payment = [];
      else {
        payment = await strapi.service('api::transaction.transaction').payment.getPaymentChannel();
        if(!outlet.cod) payment = payment.filter(p=>p.channel_category!=='COD');
        if(!outlet.online_payment) payment = payment.filter(p=>p.channel_category==='COD');
      }
  
      return this.transformResponse(payment);
    }
  }
});
