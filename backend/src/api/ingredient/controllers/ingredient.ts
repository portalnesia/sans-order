/**
 *  ingredient controller
 */

import { factories } from '@strapi/strapi'
import { Ingredient } from '../../../../types/Ingredient';
import { Outlet } from '../../../../types/Outlet';
import { getDayJs } from '../../../../utils/Main';

export default factories.createCoreController('api::ingredient.ingredient',({strapi}) => ({
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

    const query = {
      ...ctx.query,
      filters:{
        ...ctx.query.filters,
        outlet:{
          id:{
            $eq: `${outlet?.id}`
          }
        }
      },
      sort:{
        id:'desc'
      }
    }
    const {results,pagination} =  await strapi.entityService.findPage('api::ingredient.ingredient',query)

    const now = getDayJs();

    const data = await Promise.all(results.map(async(d)=>{
      const [stockIn,stockOut] = await Promise.all([
        strapi.db.query('api::stock.stock').sum({
          where:{
            type:'in',
            item:{
              id:{
                $eq: d.id
              }
            },
            timestamp:{
              $gte: now.subtract(1,'month').format('YYYY-MM-DD')
            }
          }
        },'stocks'),
        strapi.db.query('api::stock.stock').sum({
          where:{
            type:'out',
            item:{
              id:{
                $eq: d.id
              }
            },
            timestamp:{
              $gte: now.subtract(1,'month').format('YYYY-MM-DD')
            }
          }
        },'stocks')
      ])

      return {
        ...d,
        stock:stockIn-stockOut
      }
    }))

    return this.transformResponse(data,{pagination})
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

    await strapi.db.query('api::ingredient.ingredient').delete({
      where
    })

    return this.transformResponse({ok:true});
  }
}));
