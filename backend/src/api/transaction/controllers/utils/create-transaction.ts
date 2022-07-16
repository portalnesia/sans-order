import { Dayjs } from "dayjs";
import { Context } from "koa";
import { ChannelProps } from "xendit-node/src/ewallet/ewallet_charge";
import { Outlet } from "../../../../../types/Outlet";
import { PAYMENT_TYPE, BANK_CODES, EWALLET_CODE, PAYMENT_STATUS, ORDER_STATUS } from "../../../../../types/Payment";
import { PaymentError } from "../../../../utils/payment";
import * as Main from '../../../../../utils/Main';
import type {Strapi} from '@strapi/strapi'

async function createTransaction(strapi: Strapi,ctx: Context) {
  try {
    const outlet = ctx.state.outlet as Outlet;
    const user = ctx.state.user;
    
    const service = strapi.service('api::transaction.transaction')?.payment;
    if(!service) return ctx.throw(503,"Service Unavailable");

    // @ts-ignore
    let data = ctx.request?.body?.data||{};
    data = await this.sanitizeInput(data, ctx);
    

    if(!data.items) return ctx.badRequest('Missing "items" parameters');
    if(!Array.isArray(data.items)) return ctx.badRequest('Invalid "items" parameters');
    if(!data.items?.[0]?.qty) return ctx.badRequest('Missing "items.qty" parameters');
    if(!data.items?.[0]?.item) return ctx.badRequest('Missing "items.item" parameters');
    const payment_req = typeof data.payment === 'object' ? data.payment : undefined;
    const type = data.type;
    const cash = data.cash;
    const name = data.name;
    const email = data.email;
    const telephone = data.telephone;
    const metadata = data.metadata

    let payment: PAYMENT_TYPE,paymentOpts: {type?: PAYMENT_TYPE,bank?: BANK_CODES,channelCode?: EWALLET_CODE,channelProperties?:ChannelProps}={};

    if(payment_req && data.type !== 'cashier') {
      paymentOpts = service.validateBody(payment_req);
      payment = paymentOpts?.type||PAYMENT_TYPE.COD
    } else {
      if(data.type !== 'cashier') return ctx.badRequest('Invalid type parameters');
      payment = PAYMENT_TYPE.COD;
    }
    const status = payment === PAYMENT_TYPE.COD || type === 'cashier' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING;

    if(type === 'cashier') {
      if(!cash) return ctx.badRequest('Missingn "cash" parameters');
    } else {
      if(!user && (!email || !name)) return ctx.badRequest('Missing name or email parameters')
    }

    data.outlet = outlet.id

    if(data.type === 'cashier') {
      if(outlet?.toko?.user?.id != user?.id) {
        const users = outlet?.users?.find(u=>u?.user?.id == user?.id && !u.pending && u.roles.find(r=>r.name === 'Transaction') !== undefined);
        if(!users) return ctx.forbidden("You are forbidden to add transaction for this outlet");
      }
    }

    const date = Main.getDayJs();

    if(type === 'self_order') {
      console.log("CHECK1")
      if(!outlet.self_order && process.env.NODE_ENV === 'production') return ctx.forbidden("Transactions failed. This merchant not implemented `self_order` services")
      console.log("CHECK2")
      if(!service.checkOutletIsOpen(outlet) && process.env.NODE_ENV === 'production') return ctx.forbidden("Merchant is closed");
      console.log("CHECK3")
      if(outlet.busy && process.env.NODE_ENV === 'production') return ctx.forbidden("Merchant is temporary closed");
      console.log("CHECK4")
      const socket = await service.fetchSocket(s=>s.rooms.has(`outlet::${outlet.toko?.id}::${outlet.id}`) && !!s.data.outlet?.dashboard);

      if(socket.length === 0 && process.env.PN_ENV === 'production') return ctx.forbidden("Merchant is temporary closed");
      console.log("CHECK5")
    }

    const {total,subtotal,disscount,items,items_stock} = await service.checkItemForTransaction(data.items,outlet);
    const changes = (cash||total)-total;
    if(changes < 0) throw new PaymentError("Cash is less than the total transaction price",400);

    const {counter,id:uid} = service.createTransactionId(outlet);
    
    let payload: {expired: Dayjs|null,payload:any}|undefined=undefined;

    if(type !== 'cashier') {
      
      throw new PaymentError("Missing payment parameters",400);
      /*if(!payment_req) throw new PaymentError("Missing payment parameters",400);
      const user_email = user ? user.email : email as string;
      const user_name = user ? user.name : name as string;
      const user_telephone = user ? user.telephone : telephone;

      const defaultOptions: ICreatePayment = {
        uid,
        datetime:date,
        updated:date,
        payment: type,
        items,
        email:user_email,
        name:user_name,
        telephone:user_telephone,
        subtotal,
        total,
        cash:total,
        outlet,
        disscount,
        platform_fees:0,
      }

      // COD
      if(payment_req.type === 'COD') {
        if(!outlet.cod) throw new PaymentError("Transactions failed. This toko not implemented `cash on delivery`",403)

        payload = await service.createPayment(defaultOptions);
      }
      // ONLINE PAYMENT
      else {
        if(!outlet.online_payment) throw new PaymentError("Transactions failed. This toko not implemented `online_payment`",403);

        // VA
        if(payment == PAYMENT_TYPE.VIRTUAL_ACCOUNT) {
          const va: VirtualAccOpts = {
            externalID:uid,
            bankCode:payment_req.bank,
            name:user_name,
            expectedAmt:total,
          }
          payload = await service.createPayment({
            ...defaultOptions,
            va
          })
        }
        // QRIS
        else if(payment === PAYMENT_TYPE.QRIS) {
          const qr: QrCodeOpts = {
            amount:total,
            externalID:uid
          }
          payload = await service.createPayment({
            ...defaultOptions,
            qr
          })
        }
        // EWALLET
        else if(payment === PAYMENT_TYPE.EWALLET && paymentOpts.channelCode && paymentOpts.channelProperties) {
          const ewallet: EWalletOpts = {
            referenceID:uid,
            amount:total,
            channelCode: paymentOpts.channelCode,
            channelProperties:paymentOpts.channelProperties
          }
          payload = await service.createPayment({
            ...defaultOptions,
            ewallet
          })
        }
      }*/
    }

    const insert = {
      uid,
      outlet: outlet.id,
      subtotal,
      total,
      disscount,
      cash:(cash||total),
      datetime:date.pn_format(),
      updated:date.pn_format(),
      payment,
      status,
      order_status:type === 'cashier' ? ORDER_STATUS.PROCESSING : ORDER_STATUS.PENDING,
      type,
      ...(type === 'self_order' && user ? {
        user
      } : {
        name,
        email,
        telephone
      }),
      cashier: type === 'cashier' && user ? user.id : null,
      //...(payload?.payload ? {payload:JSON.stringify(payload.payload)} : {}),
      //...(payload?.expired ? {expired:payload.expired.pn_format()} : {}),
      ...(name ? {name} : {}),
      ...(email ? {email} : {}),
      ...(metadata ? {metadata:JSON.stringify(metadata)} : {}),
    }

    const [entry,_] = await Promise.all([
      strapi.entityService.create('api::transaction.transaction',{data:insert}),
      strapi.entityService.update('api::outlet.outlet',outlet.id,{data:{idcounter:counter}}),
    ]);
    const iitems = await Promise.all(items.map(async(i)=>{
      const data = {
        ...i,
        outlet: outlet.id,
        transaction: entry?.id,
        item: i?.item?.id
      }
      
      return await strapi.entityService.create('api::transaction-item.transaction-item',{data});
    }))

    if(type === 'cashier') {
      await Promise.all(items_stock.map(async(i)=>{
        const r = i.recipes.find(r=>r.item?.id === i.item?.id);
        if(r) {
          return strapi.entityService.create('api::stock.stock',{
            data:{
              outlet:outlet.id,
              item: i.item?.id,
              price:i.price,
              type:'out',
              stocks:r.consume,
              timestamp:date.toDate()
            }
          })
        }
        return Promise.resolve();
      }))
    }

    const [token] = await Promise.all([
      strapi.plugins['users-permissions'].services.jwt.issue({id:entry.id,outlet_id:outlet.id},{expiresIn:'15m'}),
      strapi.entityService.update('api::transaction.transaction',entry.id,{
        data:{
          items:iitems
        },
        filters:{
          transaction:{
            id:{
              $eq: entry.id
            }
          }
        }
      })
    ])
    await strapi.entityService.update('api::transaction.transaction',entry.id,{
      data:{
        items:iitems
      }
    })

    const output = {
      ...entry,
      items:iitems,
      user: type === 'self_order' && user ? {
        name: user.name,
        email: user.email,
        telephone: user.telephone
      } : {
        name,
        email,
        telephone
      },
      token
    }
    
    const sanitizedEntity = await this.sanitizeOutput(output, ctx);
    return this.transformResponse(sanitizedEntity);
  } catch(e) {
    if(e instanceof PaymentError) {
      ctx.throw(e.code,e.message);
    } else {
      console.log(e)
      throw e;
    }
  }
}

export async function payTransactionByCahier(strapi: Strapi,ctx: Context) {
  const outlet = ctx.state.outlet as Outlet;
  const user = ctx.state.user;
  const id = ctx.params?.id

  if(!user) return ctx.forbidden(`You are forbidden to add transaction`);

  if(outlet?.toko?.user?.id != user?.id) {
    const users = outlet?.users?.find(u=>u?.user?.id == user?.id && !u.pending && u.roles.find(r=>r.name === 'Transaction') !== undefined);
    if(!users) return ctx.forbidden("You are forbidden to add transaction for this outlet");
  }
  
  const service = strapi.service('api::transaction.transaction')?.payment;
  if(!service) return ctx.throw(503,"Service Unavailable");

  // @ts-ignore
  let dt = ctx.request?.body?.data||{};
  dt = await this.sanitizeInput(dt, ctx);
  const cash = dt?.cash;

  if(cash) return ctx.badRequest('Missing "Cash" parameters');
  if(typeof cash !== 'number') return ctx.badRequest('Invalid "Cash" parameters');
  
  const tr = await strapi.entityService.findOne('api::transaction.transaction',id,{
    populate:{
      items:{
        populate:'item'
      }
    }
  })
  if(!tr) return ctx.notFound('Transaction not found');

  const changes = cash - tr.total;
  if(changes < 0) return ctx.badRequest("Cash is less than the total transaction price");

  const data = {
    cash,
    status: PAYMENT_STATUS.PAID,
    order_status:ORDER_STATUS.PROCESSING,
    updated: Main.getDayJs().toDate(),
    cashier: user.id
  }

  const result = await strapi.entityService.update('api::transaction.transaction',id,{data,populate:{
    items:{
      populate:'item'
    }
  }});

  return {result,meta:{}}
}

export default createTransaction;