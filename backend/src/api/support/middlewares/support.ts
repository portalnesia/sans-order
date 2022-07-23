import { isTrue } from "@portalnesia/utils";
import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";
import { Support } from "../../../../types/Support";

export default (config: any, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context, next: Next) => {
    try {
      const {support_id} = ctx.params;
      const user = ctx.state.user;
      const admin = isTrue(ctx.query?.admin);
      if(!support_id) return ctx.notFound(`"Support" not found`); 

      const support = await strapi.entityService.findOne('api::support.support',support_id,{
        populate:{
          user:'*'
        },
        ...(user && !admin ? {
          filters:{
            user:{
              id:{
                $eq: user.id
              }
            }
          }
        } : {})
      });

      if(!support) return ctx.notFound(`"Outlet" not found`);
      
      ctx.state.support = support;
      return next();
    } catch(e) {
      console.log("MIDDLEWARES ERROR",e)
    }
  };
};