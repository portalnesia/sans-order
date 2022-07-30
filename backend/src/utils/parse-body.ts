import {Context} from 'koa'
import { parseMultipartData } from '@strapi/utils';

export const parseBody = (ctx: Context) => {
  if (ctx.is('multipart')) {
    return parseMultipartData(ctx);
  }

  // @ts-ignore
  const { data } = ctx.request.body || {};

  return { data };
};