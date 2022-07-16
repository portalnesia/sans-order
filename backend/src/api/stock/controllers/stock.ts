/**
 *  stock controller
 */

import { factories } from '@strapi/strapi'
import { Outlet } from '../../../../types/Outlet';
import { getDayJs } from '../../../../utils/Main';

export default factories.createCoreController('api::stock.stock',({strapi}) => ({
  async create(ctx) {
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
      },
      populate:{
        item:'*'
      }
    };

    ctx.request.body.data = {
      ...ctx.request.body?.data,
      outlet:outlet.id,
      timestamp: ctx.request?.body?.data?.timestamp ? ctx.request.body.data.timestamp : getDayJs().toDate()
    };
    

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
      },
      populate:{
        item:'*'
      }
    }

    const output =  await super.find(ctx)
    return output;
  },
  async update(ctx) {
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
      },
      populate:{
        item:'*'
      }
    };
    
    ctx.request.body.data = {
      outlet:outlet.id,
      ...(ctx.request.body?.data?.timestamp ? {
        timestamp: ctx.request.body?.data?.timestamp
      } : {})
    };

    return await super.update(ctx);
  },
}));
