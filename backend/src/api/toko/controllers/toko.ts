/**
 *  toko controller
 */

import { slugFormat } from '@portalnesia/utils';
import { factories } from '@strapi/strapi'
import { Outlet } from '../../../../types/Outlet';
import { Toko } from '../../../../types/Toko';
import checkTokoSubscription from '../../../utils/check-subscription';
import { sanitisizedPopulate } from '../../../utils/ctx';

export default factories.createCoreController('api::toko.toko',({strapi}) => ({
  async create(ctx) {
    const user = ctx.state?.user;
    if(!user) return ctx.forbidden('You are forbidden to add merchant');
    const subs = await checkTokoSubscription(strapi,user);
    if(!subs) return ctx.forbidden('You are forbidden to add merchant');

    const count = await strapi.db.query('api::toko.toko').count({
      where:{
        user:{
          id:{
            $eq: subs?.user?.id
          }
        }
      }
    })

    if(count >= subs.max_toko) return ctx.forbidden('You have reached the maximum limit for creating merchant',{limit:subs.max_toko});

    const name = ctx.request.body.data?.name;

    const data = {
      ...(ctx.request.body.data||{}),
      ...(name ? {
        slug: slugFormat(name)
      } : {}),
      user:user.id
    }
    const toko = await strapi.entityService.create('api::toko.toko',{data,populate:{logo:'*',user:'*'}})

    return this.transformResponse(toko);
  },
  async find(ctx) {
    try {
      const user = ctx.state.user;
      if(!user) return ctx.notFound();

      const populate = sanitisizedPopulate(ctx);
      populate.logo={
        populate:'*',
        fields:['id','url']
      }
      populate.user = {
        populate:'*',
        fields:['id','name','username','blocked','picture']
      }

      ctx.query.populate = populate;
      ctx.query.filters = {
        user:{
          id:{
            $eq: user.id
          }
        }
      }
      return await super.find(ctx);
    } catch(e) {
      console.log(e)
    }
  },
  async findOne(ctx) {
    const {id} = ctx.params;
    const populate = sanitisizedPopulate(ctx);
    populate.logo={
      fields:['id','url']
    }
    populate.user = {
      ffields:['id','name','username','blocked','picture']
    }
    
    const data = await strapi.entityService.findMany<'api::toko.toko',Toko>('api::toko.toko',{
      populate,
      limit:1,
      filters:{
        slug:id
      }
    });
    
    const subs = await checkTokoSubscription(strapi,data?.[0]?.user);
    if(!subs) return ctx.notFound();
    // @ts-ignore
    const {password,resetPasswordToken,confirmationToken,confirmed,...rest} = data?.[0]?.user;

    const output = {...data?.[0],user:rest};

    const sanitizedEntity = await this.sanitizeOutput(output, ctx);
    return this.transformResponse(sanitizedEntity);
  },
  async update(ctx) {
    const user = ctx.state?.user;
    const {id} = ctx.params;

    const data = await strapi.entityService.findOne<'api::toko.toko',Toko>('api::toko.toko',id,{populate:['user']});
    const subs = await checkTokoSubscription(strapi,data?.user);
    if(!subs) return ctx.notFound();

    if(!user) return ctx.forbidden('You are forbidden to edit this merchant');
    if(!data || data.user?.id != user.id) return ctx.forbidden('You are forbidden to edit this merchant');

    return await super.update(ctx);
  },
  async delete(ctx) {
    const user = ctx.state?.user;
    const {id} = ctx.params;

    const data = await strapi.entityService.findOne('api::toko.toko',id,{populate:'*'});
    const subs = await checkTokoSubscription(strapi,data?.user);
    if(!subs) return ctx.notFound();

    if(!user) return ctx.forbidden('You are forbidden to delete this merchant',{logged_in:false});
    if(!data || data.user?.id != user.id) return ctx.forbidden('You are forbidden to delete this merchant');

    return await strapi.service('api::toko.toko').delete(id,ctx.query)
  },
  async findOutlets(ctx) {
    try {
      const {toko_slug} = ctx.params;

      const filters = {
        toko:{
          slug:{
            $eq: toko_slug
          }
        }
      }
      const populate = {
        toko:{
          populate:{
            logo:{
              populate:'*',
              fields:['id','url']
            },
            user: {
              populate:'*',
              fields:['id','name','username','blocked','picture']
            }
          }
        }
      }

      const {results,pagination} = await strapi.entityService.findPage<'api::outlet.outlet',Outlet>('api::outlet.outlet',{...ctx?.query,filters,populate})

      const subs = await checkTokoSubscription(strapi,results?.[0]?.toko?.user);
      if(!subs) return ctx.notFound();

      const data = results.map(({toko,idcounter,...d}) => ({...d}))

      const sanitizedEntity = await this.sanitizeOutput(data, ctx);
      return this.transformResponse(sanitizedEntity,{pagination});
    } catch(e) {
      console.log(e)
    }
  }
})); 
