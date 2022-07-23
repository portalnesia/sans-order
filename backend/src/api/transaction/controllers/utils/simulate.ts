import type { Strapi } from "@strapi/strapi";
import type { Context } from "koa";
import { Outlet } from "../../../../../types/Outlet";
import { ORDER_STATUS, PAYMENT_TYPE } from "../../../../../types/Payment";

export default async function simulatePayment(strapi: Strapi,ctx: Context) {
  const outlet = ctx.state.outlet as Outlet
  const {id} = ctx.params;

  const tr = await strapi.entityService.findOne('api::transaction.transaction',id,{
    filters:{
      outlet:{
        $and: [
          {
            id:{
              $eq: outlet.id
            }
          }
          ,{
            type:{
              $ne: 'cashier'
            }
          },{
            status:{
              $eq: ORDER_STATUS.PENDING
            }
          }
        ]
      }
    },
    populate:{
      outlet:{
        populate:{
          toko:{
            populate:'user'
          }
        }
      },
      items:{
        populate:{
          item:{
            populate:{
              recipes:{
                populate:'*'
              }
            }
          }
        }
      },
      cashier:'*',
      user:'*'
    }
  })

  if(!tr) return ctx.notFound(`"Transactions" not found`);

  const data = await strapi.service('api::transaction.transaction').payment.simulatePayment(tr.payment as PAYMENT_TYPE,tr);

  return {data,meta:{}}
}