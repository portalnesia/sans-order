import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";

export default (config: any, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context, next: Next) => {
    //const auth = !!(ctx?.state?.auth?.strategy?.name === 'api-token' || !!ctx?.state?.user)
    //if(!auth) return ctx.forbidden();
    //const user = await strapi.entityService.findOne('plugin::users-permissions.user',2,{})
    //ctx.state.user = user;
    
    return next();
  };
};