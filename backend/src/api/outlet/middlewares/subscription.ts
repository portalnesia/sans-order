import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";
import { Outlet } from "../../../../types/Outlet";
import checkTokoSubscription from "../../../utils/check-subscription";

export default (config: {roles?: string,action?: string}, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context, next: Next) => {
    try {
      const outlet = ctx.state.outlet;
      if(!outlet) return ctx.notFound();
      const subs = await checkTokoSubscription(strapi,outlet?.toko?.user);
      if(!subs) return ctx.notFound();
      ctx.state.subs = subs;
      return next();
    } catch(e) {
      console.log("MIDDLEWARES ERROR",e)
    }
  };
};