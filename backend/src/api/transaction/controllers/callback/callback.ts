import { Context } from "koa";
import { Strapi } from "@strapi/strapi";

export async function callbackVA(strapi: Strapi,ctx: Context) {
  try {
    if(ctx.request.headers?.['x-callback-token'] === process.env.XENDIT_CALLBACKTOKEN) {
      if(['paid','status'].includes(ctx.params.type)) {
        const service = strapi.service('api::transaction.transaction').payment;

        await service.callbackVA(ctx.params.type as 'paid'|'status',ctx.request.body);
        ctx.status = 200;
        return;
      }
    }
    return ctx.notFound();
  } catch {
    return ctx.throw(503,"Maintenance")
  }
}

export async function callbackEwallet(strapi: Strapi,ctx: Context) {
  try {
    if(ctx.request.headers?.['x-callback-token'] === process.env.XENDIT_CALLBACKTOKEN) {
      const service = strapi.service('api::transaction.transaction').payment;

      await service.callbackEwallet(ctx.request.body);
      ctx.status = 200;
      return;
    }
    return ctx.notFound();
  } catch {
    return ctx.throw(503,"Maintenance")
  }
}

export async function callbackQr(strapi: Strapi,ctx: Context) {
  try {
    if(ctx.request.headers?.['x-callback-token'] === process.env.XENDIT_CALLBACKTOKEN) {
      const service = strapi.service('api::transaction.transaction').payment;

      await service.callbackQrCode(ctx.request.body);
      ctx.status = 200;
      return;
    }
    return ctx.notFound();
  } catch {
    return ctx.throw(503,"Maintenance")
  }
}

export async function callbackSendMoney(strapi: Strapi,ctx: Context) {
  try {
    if(ctx.request.headers?.['x-callback-token'] === process.env.XENDIT_CALLBACKTOKEN) {
      const service = strapi.service('api::transaction.transaction').payment;

      await service.callbackSendMoney(ctx.request.body);
      ctx.status = 200;
      return;
    }
    return ctx.notFound();
  } catch {
    return ctx.throw(503,"Maintenance")
  }
}