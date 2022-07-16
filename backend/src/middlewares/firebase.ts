import { Strapi } from "@strapi/strapi";
import { Context, Next } from "koa";
import firebase from "../utils/firebase";

export default (config: any, { strapi }: {strapi: Strapi})=> {
  return async(ctx: Context,next: Next)=>{
    try {
      if(ctx.query?.size || 
      ctx?.query.pageSize) {
        ctx.query = {
          ...ctx.query,
          pagination:{
            page:ctx?.query?.page,
            pageSize:ctx?.query?.pageSize
          }
        }
        delete ctx.query.page;
        delete ctx.query.pageSize;
      }
      //if(!ctx.url.startsWith("/api/connect") && !ctx.url.startsWith("/api/auth") && ctx.url.startsWith("/api")) await firebase.appCheck().verifyToken(ctx.request.headers['x-app-token'] as string);
      return next();
    } catch {
      return ctx.forbidden();
    }
  }
}