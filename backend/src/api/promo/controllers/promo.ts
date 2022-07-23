/**
 *  promo controller
 */

import { factories } from '@strapi/strapi'
import { Outlet } from '../../../../types/Outlet';

export default factories.createCoreController('api::promo.promo',({strapi}) => ({
  async create(ctx) {
    const outlet = ctx.state.outlet as Outlet;
    
    (ctx.request.body.data||{}).outlet = outlet.id;

    return await super.create(ctx);
  },
  async findOne(ctx) {
    const outlet = ctx.state.outlet as Outlet;

    ctx.query = {
      ...ctx.query,
      filters:{
        ...ctx.query.filters,
        outlet:{
          id:{
            $eq: `${outlet?.id}`
          }
        }
      }
    }

    return await super.findOne(ctx)
  },
  async find(ctx) {
    const outlet = ctx.state.outlet as Outlet;

    ctx.query = {
      ...ctx.query,
      filters:{
        ...ctx.query.filters,
        outlet:{
          id:{
            $eq: `${outlet?.id}`
          }
        }
      }
    }
    const output =  await super.find(ctx)
    return output;
  },
  async update(ctx) {
    const outlet = ctx.state.outlet as Outlet;
    const {id} = ctx.params

    const data = ctx.request.body.data;
    data.outlet = outlet.id;

    const results = await strapi.entityService.update('api::promo.promo',id,{
      data,
      populate:{
        image:'*',
        products:'*'
      }
    })

    return this.transformResponse(results);
  },
  async bulkDelete(ctx) {
    const outlet = ctx.state.outlet as Outlet;
    const filter = ctx.request.body?.data?.filters;
    if(!Array.isArray(filter)) return ctx.badRequest('Invalid "filters" parameter');

    filter.forEach(f=>{
      if(typeof f !== 'number') {
        return ctx.badRequest('Invalid "filters" parameter');
      }
    })
    
    const where = {
      $and:[{
        id:{
          $in: filter
        }
      },{
        outlet:{
          id:{
            $eq: outlet.id
          }
        }
      }]
    }

    await strapi.db.query('api::promo.promo').delete({
      where
    })

    return this.transformResponse({ok:true});
  }
}))
