import type { Strapi } from "@strapi/strapi";
import type { Context } from "koa";
import type { Outlet } from "../../../../../types/Outlet";
import { sanitisizedPopulate } from "../../../../utils/ctx";
import { PaymentError } from "../../../../utils/payment";
import getFilter from "./get-filter";


export default async function find(strapi: Strapi,ctx: Context) {
  try {
    const outlet = ctx.state.outlet as Outlet;

    const service = strapi.service('api::transaction.transaction')?.payment;

    const filter = getFilter(ctx);
    const {filters} = service.getFilteredTransaction(filter)
    const populate = sanitisizedPopulate(ctx);
    populate.user = '*'
    populate.cashier = '*'
    populate.items = {
      populate:'item'
    }
    populate.toko = {
      populate:'user'
    }

    ctx.query = {
      ...ctx.query,
      filters:{
        ...ctx.query.filters,
        $and:[
          ...filters.$and,
          {
            outlet:{
              id:{
                $eq: `${outlet?.id}`
              }
            }
          },
        ]
      },
      sort:{datetime:'desc'},
      populate
    }
    const {results:data,pagination} =  await strapi.service('api::transaction.transaction').find(ctx?.query||{})

    const dt = await Promise.all(data?.map(async(d)=>{
      const token = await strapi.plugins['users-permissions'].services.jwt.issue({id:d.id,outlet_id:outlet.id},{expiresIn:'15m'})
      const {name,email,telephone,user:dUser,...rest} = d;
      return {
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
    }))
    
    return this.transformResponse(dt,{pagination});
  } catch(e) {
    if(e instanceof PaymentError) {
      ctx.throw(e.code,e.message);
    } else {
      console.log(e)
      ctx.throw(503,"Service Unavailable");
    }
  }
}