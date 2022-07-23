import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";

export default (config: any, { strapi }: {strapi: Strapi}) => {
  return async(ctx: Context, next: Next) => {
    if(ctx.request.headers?.['x-callback-token'] !== process.env.XENDIT_CALLBACKTOKEN) return ctx.notFound();
    return await next();
  }
}