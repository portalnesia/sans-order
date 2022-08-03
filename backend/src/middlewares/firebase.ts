import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";
import firebase from "../utils/firebase";

export default (config: any, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context,next: Next)=>{
    try {
      if(ctx?.query?.size || 
      ctx?.query?.pageSize) {
        ctx.query = {
          ...ctx.query,
          pagination:{
            ...ctx?.query?.pagination,
            page:ctx?.query?.page,
            pageSize:ctx?.query?.pageSize
          }
        }
        delete ctx.query.page;
        delete ctx.query.pageSize;
      }
      if(typeof ctx.request.headers?.['x-backend-token'] === 'string') {
        const token = ctx.request.headers?.['x-backend-token'];
        await strapi.plugins['users-permissions'].services.jwt.verify(token,{
          subject:'backend-services',
          issuer:'portalnesia.com',
        });
      } else {
        if(!ctx.url.startsWith("/api/connect") &&
         !ctx.url.startsWith("/api/auth") && 
         !ctx.url.startsWith("/api/callback") && 
         !ctx.url.startsWith("/api/transactions/print") && 
         !ctx.url.startsWith("/api/transactions/report") && 
         ctx.url.startsWith("/api")
        ) {
          if(typeof ctx.request.headers?.['x-app-token'] !== 'string') return ctx.unauthorized();
          else await firebase?.appCheck()?.verifyToken(ctx.request.headers['x-app-token'] as string);
        }
      }
      
      return next();
    } catch {
      return ctx.unauthorized();
    }
  }
}