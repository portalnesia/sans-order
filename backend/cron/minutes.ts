import type { Strapi } from "@strapi/strapi"
import { Dayjs } from "dayjs";
import { ORDER_STATUS, PAYMENT_STATUS } from "../types/Payment";
import { getDayJs } from "../utils/Main"

async function expiredTransactions({strapi,now}: {strapi: Strapi,now: Dayjs}) {
  try {
    const tr = await strapi.entityService.findMany('api::transaction.transaction',{
      filters:{
        $and:[{
          type:{
            $eq:'self_order'
          }
        },{
          $or:[{
            status:{
              $eq:PAYMENT_STATUS.PENDING
            }
          },{
            order_status:{
              $eq:ORDER_STATUS.PENDING
            }
          }]
        },{
          expired:{
            $lte: now.toDate()
          }
        }]
      }
    })

    if(tr.length > 0) {
      await Promise.all(tr.map(async(t)=>{
        let result: object|undefined;
        if(t.payment === 'VIRTUAL_ACCOUNT' && typeof t?.payload?.id === 'string') {
          result = await strapi.service('api::transaction.transaction').payment.expiredVirtualAccount(t.payload.id)
        }
        await strapi.entityService.update('api::transaction.transaction',t.id,{
          data:{
            status:PAYMENT_STATUS.EXPIRED,
            order_status:ORDER_STATUS.CANCELED,
            ...(result ? {payload:result} : {})
          }
        })
      }))
    }
  } catch(e) {
    console.log("Cron Error, expiredTransactions",e)
  }
}

async function canceledOrderTransactions({strapi,now}: {strapi: Strapi,now: Dayjs}) {
  try {
    const tr = await strapi.entityService.findMany('api::transaction.transaction',{
      filters:{
        $and:[{
          type:{
            $eq:'self_order'
          }
        },{
          status:{
            $eq:PAYMENT_STATUS.PAID
          }
        },{
          order_status:{
            $eq:ORDER_STATUS.PROCESSING
          }
        },{
          updated:{
            $lte: now.add(6,'hour').toDate()
          }
        }]
      }
    })

    if(tr.length > 0) {
      await Promise.all(tr.map(async(t)=>{
        await strapi.entityService.update('api::transaction.transaction',t.id,{
          data:{
            order_status:ORDER_STATUS.FINISHED
          }
        })
      }))
    }
  } catch(e) {
    console.log("Cron Error, canceledOrderTransactions",e)
  }
}

export default async function minutesCronJob({strapi}: {strapi: Strapi}) {
  const now = getDayJs();
  //console.log("CRON JOBS RUNNING",now.toDate())
  await Promise.all([
    expiredTransactions({strapi,now}),
    canceledOrderTransactions({strapi,now})
  ])
}