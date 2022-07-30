import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";
import { Outlet } from "../../../../types/Outlet";

export default (config: {roles?: string,action?: string}, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context, next: Next) => {
    try {
      const {roles='',action='update'} = config;

      const outlet = ctx.state.outlet as Outlet;
      const user = ctx.state?.user;
      if(!user) return ctx.forbidden(`You are forbidden to ${action.toLowerCase()} this ${roles.toLowerCase()}`);

      if(outlet?.toko?.user?.id != user.id) {
        const users = outlet?.users?.find(u=>u?.user?.id == user.id && !u.pending && u.roles.find(r=>r.name === roles) !== undefined);
        if(!users) return ctx.forbidden(`You are forbidden to ${action.toLowerCase()} this ${roles.toLowerCase()}`);
      }
      
      return next();
    } catch(e) {
      console.log("MIDDLEWARES ERROR",e)
    }
  };
};