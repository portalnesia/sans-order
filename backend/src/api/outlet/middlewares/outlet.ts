import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";
import { Outlet } from "../../../../types/Outlet";

export default (config: any, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context, next: Next) => {
    try {
      const {outlet_id} = ctx.params;
      if(!outlet_id) return ctx.notFound(`"Outlet" not found`); 

      const outlet = await strapi.entityService.findOne<'api::outlet.outlet',Outlet>('api::outlet.outlet',outlet_id,{populate:{
        toko:{
          populate:{
            user:'*'
          }
        },
        users:{
          populate:{
            user:'*'
          }
        },
        ...(config?.populate||{})
      }});
      if(!outlet) return ctx.notFound(`"Outlet" not found`);

      ctx.state.outlet = outlet;
      return next();
    } catch(e) {
      console.log("MIDDLEWARES ERROR",e)
    }
  };
};