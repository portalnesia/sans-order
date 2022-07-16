import type { Strapi } from "@strapi/strapi";
import type { Context } from "koa";
import { Outlet } from "../../../../../types/Outlet";
import { sent404 } from "../../../../utils/ctx";
import type { IPaymentTemplateOptions } from "../../../../utils/send-email";
import getFilter from "./get-filter";

export async function generateReportToken(strapi: Strapi,ctx: Context) {
  const outlet = ctx.state.outlet as Outlet;
  const token = await strapi.plugins['users-permissions'].services.jwt.issue({outlet_id:outlet.id},{expiresIn:'15m'});
  return {data:`/api/transactions/report/${token}${ctx.query?.filter ? `?filter=${ctx.query?.filter}` : ''}`,meta:{}}
}

export async function report(strapi: Strapi,ctx: Context) {
  const token = ctx.params?.token;
  if(!token) return sent404(ctx);

  try {
    const {outlet_id} = await strapi.plugins['users-permissions'].services.jwt.verify(token);
    const outlet = await strapi.entityService.findOne('api::outlet.outlet',outlet_id,{})
    if(!outlet) return sent404(ctx);

    const service = strapi.service('api::transaction.transaction');
    const filter = getFilter(ctx);

    const {buffer,from,to} = await service.payment.exportTransactionReport(outlet,filter)

    const diff = from.diff(to,'day');
    const title = `[SansOrder] Report ${outlet.name} - ${diff === 1 ? from.pn_format('fulldate') : `${from.pn_format('fulldate')} - ${to.pn_format('fulldate')}`}`
    
    ctx.append('Content-type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    ctx.attachment(`${title}.xlsx`);
    ctx.body = buffer;
  } catch {
    return sent404(ctx);
  }
}

export default async function print(strapi: Strapi,ctx: Context) {
  const token = ctx.params?.token;
  const isPdf = (ctx.query?.action||'pdf') === 'pdf';
  const desktop = ctx.query?.device === 'desktop';

  if(!token) return sent404(ctx);
  try {
    const {id,outlet_id} = await strapi.plugins['users-permissions'].services.jwt.verify(token);
    const service = strapi.service('api::transaction.transaction');
    const tr = await service.findOne(id,{
      filters:{
        outlet: {
          id:{
            $eq: outlet_id
          }
        }
      },
      populate:{
        outlet:{
          populate:{
            toko:{
              populate:'logo'
            }
          }
        },
        user:'*',
        cashier:'*',
        items:{
          populate:'item'
        }
      }
    })
    
    if(!tr) return sent404(ctx);

    if(isPdf) {
      if(tr.type === 'cashier') return sent404(ctx);

      const opt = service.payment.getOptionsFromDb(tr);
      const footer = {
        "Subtotal":opt.subtotal,
        ...(tr?.type === 'withdraw' && opt.platform_fees > 0 ? {"Fees":opt.platform_fees} : opt.disscount > 0 ? {"Disscount":opt.disscount} : {})
      }
      let emailOpt: IPaymentTemplateOptions
      const subject = service.payment.getEmailSubject('cod',opt);
      if(tr.type === 'withdraw') {
        emailOpt = service.payment.getSendEmailOptions('send_money',{...opt,item_name:"Withdrawal Payment",bank_code:tr?.payload?.bank_code},footer);
      } else {
        emailOpt = service.payment.getEmailOptions('cod',opt,footer);
      }
      const buffer = await service.payment.getEmailPdf(opt,emailOpt,{type:tr?.type==='withdraw' ? 'send' : 'accept'});
      ctx.append('Content-type','application/pdf');
      ctx.attachment(`${subject}.pdf`);
      ctx.body = buffer;
    } else {
      const html = await service.payment.printTransactionByCashier(tr,desktop);
      ctx.append('Content-type','text/html');
      ctx.body = html;
    }
  } catch(e) {
    console.log(e)
    return sent404(ctx);
  }
}