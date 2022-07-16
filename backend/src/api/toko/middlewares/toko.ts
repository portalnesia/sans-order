import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";
import { Toko } from "../../../../types/Toko";

export default (config: any, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context, next: Next) => {
    try {
      const {toko_slug} = ctx.params;
      if(!toko_slug) return ctx.notFound(`"Merchant" not found`); 

      const toko = await strapi.entityService.findMany<'api::toko.toko',Toko>('api::toko.toko',{
        populate:{
          user:'*',
          ...(config?.populate||{})
        },
        limit:1,
        filters:{
          slug:toko_slug
        }
      });
      if(!toko || toko.length === 0) return ctx.notFound(`"Merchant" not found`);

      ctx.state.toko = toko[0];
      return next();
    } catch(e) {
      console.log("MIDDLEWARES ERROR",e)
    }
  };
};