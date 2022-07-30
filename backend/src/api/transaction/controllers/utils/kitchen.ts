import type { Strapi } from "@strapi/strapi";
import type { Context } from "koa";
import type { Outlet } from "../../../../../types/Outlet";
import { getDayJs } from "../../../../../utils/Main";
import { sanitisizedPopulate } from "../../../../utils/ctx";
import { PaymentError } from "../../../../utils/payment";
import getFilter from "./get-filter";

export async function getKitchenTransaction(strapi: Strapi,ctx: Context) {
  const outlet = ctx.state.outlet as Outlet;

  const service = strapi.service('api::transaction.transaction')?.payment;

  const {filters} = service.getFilteredTransaction('kitchen')
  const populate = sanitisizedPopulate(ctx);
  populate.user = '*'
  populate.items = {
    populate:'item'
  }

  ctx.query = {
    ...ctx.query,
    filters:{
      $and:[
        ...filters.$and,
        {
          outlet:{
            id:{
              $eq: outlet?.id||''
            }
          }
        },{
          items:{
            done:{
              $eq: false
            }
          }
        }
      ]
    },
    orderBy:{datetime:'desc'},
    populate
  }

  const {results:data,pagination} =  await strapi.service('api::transaction.transaction').find(ctx?.query||{})

  const dt = data?.map((d)=>{
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
    }
  })

  return this.transformResponse(dt,{pagination});
}

export async function updateTransactionKitchen(strapi: Strapi,ctx: Context) {
  const outlet = ctx.state.outlet as Outlet;
  const id = ctx.params.id;
  const items_arr = ctx.request.body.data?.items;

  if(!Array.isArray(items_arr)) return ctx.badRequest('Invalid items parameters');

  const filters = {
    transaction:{
      id:{
        $eq: id
      }
    }
  }

  if(items_arr.length < 1) return ctx.badRequest('Items less than 1');

  const check = await strapi.entityService.findOne('api::transaction.transaction',id,{
    filters:{
      outlet:{
        id:{
          $eq: outlet.id
        }
      }
    }
  })
  if(!check) return ctx.notFound();

  const now = getDayJs();
  if(typeof items_arr[0]?.id !== 'number') return ctx.badRequest('Invalid items.id parameters');
  if(typeof items_arr[0]?.done !== 'boolean') return ctx.badRequest('Invalid items.done parameters');
  
  await Promise.all(items_arr.map(async(item)=>{
    await strapi.entityService.update('api::transaction-item.transaction-item',item.id,{filters,data:{done:!!item.done}})
  }));

  const tr = await strapi.entityService.update('api::transaction.transaction',id,{
    data:{updated:now.toDate()},
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

  const dt = strapi.service('api::transaction.transaction').parseUser(tr);
  
  strapi.$io.raw('toko transactions items',dt,{room:`outlet::${outlet?.toko?.id}::${outlet.id}`})

  return tr;
}