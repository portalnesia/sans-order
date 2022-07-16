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
    
    (ctx.request.body.data||{}).outlet = outlet.id;

    return await super.update(ctx);
  },
  async bulkDelete(ctx) {
    const outlet = ctx.state.outlet as Outlet;
    const filter = ctx.request.body?.data?.filters;
    if(!Array.isArray(filter)) return ctx.badRequest('Invalid "filters" parameter');
    
    const filters = {
      $and: filter.concat({
        outlet:{
          id:{
            $eq: outlet.id
          }
        }
      })
    }

    const data = strapi.db.query('api::promo.promo').delete({
      where:{
        filters
      }
    })

    return this.transformResponse(data);
  }
}))
