import { Context } from "koa";
import Path from "./path"

export async function sent404(ctx: Context) {
  const path = Path.join('root','tema','404.html');
  const html = await Path.fs.promises.readFile(path);
  ctx.status = 404;

  ctx.append('Content-type','text/html');
  ctx.body = html.toString('utf-8');
}

export function sanitisizedPopulate(ctx: Context) {
  const populate = typeof ctx?.query?.populate === 'string' ? ['*','%2A'].includes(ctx?.query?.populate) ? {[ctx.query.populate]:'*'} : {} : typeof ctx?.query?.populate === 'object' ? ctx?.query?.populate : {};

  return populate;
}