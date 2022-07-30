import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";
import checkTokoSubscription from "../../../utils/check-subscription";

export default (config: {roles?: string,action?: string}, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context, next: Next) => {
    try {
      const toko = ctx.state.toko;
      if(!toko) return ctx.notFound();
      const subs = await checkTokoSubscription(strapi,toko?.user);
      if(!subs) return ctx.notFound();
      ctx.state.subs = subs;
      return next();
    } catch(e) {
      console.log("MIDDLEWARES ERROR",e)
    }
  };
};