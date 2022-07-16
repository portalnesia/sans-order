import type { Strapi } from "@strapi/strapi";
import type { Context } from "koa";
import type { Outlet } from "../../../../../types/Outlet";import { ORDER_STATUS } from "../../../../../types/Payment";
;
import { sanitisizedPopulate } from "../../../../utils/ctx";

export async function getPendingTransaction(strapi: Strapi,ctx: Context) {
  const outlet = ctx.state.outlet as Outlet;

  const service = strapi.service('api::transaction.transaction')?.payment;

  const {filters} = service.getFilteredTransaction('pending')
  const populate = sanitisizedPopulate(ctx);
  populate.user = '*'
  populate.items = {
    populate:'item'
  }

  ctx.query = {
    ...ctx.query,
    filters:{
      $and:[
        {
          $or: filters.$or
        },
        {
          outlet:{
            id:{
              $eq: `${outlet?.id}`
            }
          }
        },
      ]
    },
    orderBy:{datetime:'desc'},
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
}

export async function updateTransactionOrderStatus(strapi: Strapi,ctx: Context) {
  const outlet = ctx.state.outlet as Outlet;
  const id = ctx.params.id;
  const status = typeof ctx.request.body.status === 'string' ? ctx.request.body.status.toUpperCase() : undefined;

  if(!status) return ctx.badRequest('Invalid status parameters');
  
  const orderStatus = Object.keys(ORDER_STATUS);
  if(!orderStatus.includes(status)) return ctx.badRequest('Invalid status parameters');

  const tr = await strapi.entityService.update('api::transaction.transaction',id,{
    data:{
      status
    },
    filters:{
      outlet:{
        id:{
          $eq: outlet.id
        }
      }
    },
    populate:{
      items:"*"
    }
  })

  strapi.$io.raw('toko transactions',tr,{room:`outlet::${outlet?.toko?.id}::${outlet.id}`})

  return tr;
}