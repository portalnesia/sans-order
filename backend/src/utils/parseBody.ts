import type { Context } from "koa";
import {parseMultipartData} from '@strapi/utils'

export function parseBody(ctx: Context): {data:Record<string,any>,files?: any} {
  if (ctx.is('multipart')) {
    return parseMultipartData(ctx);
  }

  const { data } = ctx.request.body || {};

  return { data };
};