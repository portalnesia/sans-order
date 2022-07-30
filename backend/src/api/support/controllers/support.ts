/**
 *  support controller
 */

import { isTrue, specialHTML } from '@portalnesia/utils';
import { factories } from '@strapi/strapi'
import { emailEncode, getDayJs, linkEncode, linkWrap, webUrl } from '../../../../utils/Main';
import sendEmail,{emailToName} from '../../../utils/send-email';
import {convert as htmlToText} from 'html-to-text'
import { parseBody } from '../../../utils/parseBody';

export default factories.createCoreController('api::support.support',({strapi}) => ({
  async create(ctx) {
    try {
      const user = ctx.state.user;
      const {name,email,message,...rest} = ctx.request.body?.data;

      if(!message) return ctx.badRequest('Missing message parameter')

      const data = {
        ...rest
      }
      
      const now = getDayJs();

      let from: number|undefined;
      if(user) {
        data.user = user.id;
        from = user.id
      } else {
        if(!name) return ctx.badRequest('Missing name parameter')
        if(!email) return ctx.badRequest('Missing email parameter')
        data.name = name;
        data.email = email;
      }
      data.status = 'open'

      const result = await strapi.entityService.create('api::support.support',{
        data,
        populate:{
          user:'*'
        }
      })

      await strapi.entityService.create('api::message.message',{
        data:{
          type:'support',
          room_id:result.id,
          message,
          to:1,
          datetime:now.toDate(),
          from
        }
      })

      const output = strapi.service('api::support.support').parse(result);

      // const isi = linkWrap(message);
      // KIRIM EMAIL KE PENGIRIM
      /*await sendEmail({
        email:'support-sansorder',
        subject:`Support #${output.id}: ${output.subject}`,
        to:output.email,
        template:{
          type:'basicv2',
          option:{
            replyTo:true,
            username:name,
            header:"Messages Received",
            footer:{
              extra:"You have received this service announcement to update you about your support ticket."
            },
            messages:`Thank you for contacting us. We have received your message.\n\n` + 
              `Detail:\n` + 
              `Name: ${name}\n` + 
              `Email: ${email}\n` +
              `Status: Open\n` +
              `Message:<br>${isi}\n\n` + 
              `We will try to reply your message as soon as possible.`,
            button:{
              url:webUrl(`support/${result.id}`),
              label:`View Support`
            }
          }
        }
      })*/

      // KIRIM EMAIL KE ADMIN
      /*await sendEmail({
        email:'noreply-sansorder',
        replyTo: {
          name:output.name,
          address:output.email
        },
        subject:`Support #${output.id}: ${output.subject}`,
        to:emailToName['support-sansorder'].email,
        template:{
          type:'basicv2',
          option:{
            replyTo:true,
            username:"Admin SansOrder",
            header:"New Messages",
            footer:{
              extra:"You have received this service announcement to update you about your support ticket."
            },
            messages:`There is a message from contact page.` +
              `Detail:\n` + 
              `Name: ${name}\n` + 
              `Email: ${email}\n` +
              `Status: Open\n` +
              `Message:<br>${isi}\n\n` + 
              `Please reply as soon as possible.`,
            button:{
              url:webUrl(`support/admin/${result.id}`),
              label:`View Support`
            }
          }
        }
      })*/

      return this.transformResponse(output);
    } catch(e) {
      console.log(e)
    }
  },
  async findOne(ctx) {
    const user = ctx.state.user;
    const support = ctx.state.support;
    if(!support) return ctx.notFound();
    const admin = isTrue(ctx?.query?.admin) && !!user?.admin;

    if(!admin && ((support.user && support.user.id != user?.id) || (!support.user && user))) return ctx.badRequest('Support message not found');

    const s = strapi.service('api::support.support').parse(support);

    const msg = await strapi.entityService.findMany('api::message.message',{
      filters:{
        room_id:{
          $eq: s.id
        }
      },
      limit:1
    })

    const output = {
      ...s,
      messages: msg.length > 0 ? msg[0] : null
    }

    return this.transformResponse(output);
  },
  async find(ctx) {
    const user = ctx.state.user;
    if(!user) return ctx.notFound();
    const admin = isTrue(ctx?.query?.admin) && user.admin;

    const statusToIndex = {
      open:1,
      answered:2,
      ['customer-reply']: 3,
      close:0
    }

    const {results,pagination} = await strapi.entityService.findPage('api::support.support',{
      filters:{
        ...(!admin ? {
          user:{
            id:{
              $eq: user.id
            }
          }
        } : {})
      },
      populate:{
        user:'*'
      },
    })

    const output = await Promise.all(results.map(async(r)=>{
      const msg = await strapi.entityService.findMany('api::message.message',{
        filters:{
          room_id:{
            $eq: r.id
          }
        },
        limit:1
      })
      const s = strapi.service('api::support.support').parse(r)
      return {
        ...s,
        messages: msg.length > 0 ? msg[0] : null
      }
    }))

    output.sort((a,b) => statusToIndex[a.status] - statusToIndex[b.status])

    return this.transformResponse(output,pagination);
  },
  async findMessage(ctx) {
    const user = ctx.state.user;
    const support = ctx.state.support;
    if(!support) return ctx.badRequest('Support message not found');
    const admin = isTrue(ctx?.query?.admin) && user?.admin;

    if(!admin && ((support.user && support.user.id != user?.id) || (!support.user && user))) return ctx.badRequest('Support message not found');

    const {results,pagination} = await strapi.entityService.findPage('api::message.message',{
      populate:{
        from:'*',
        to:'*',
        file:'*'
      },
      filters:{
        type:{
          $eq:'support',
        },
        room_id:{
          $eq: support?.id
        }
      },
      sort:{
        id:'desc'
      }
    })

    return this.transformResponse(results,pagination);
  },
  async reply(ctx) {
    const user = ctx.state.user;
    const support = ctx.state.support;
    let {data,files} = parseBody(ctx);

    if(!support) return ctx.badRequest('Support message not found');

    const s = strapi.service('api::support.support').parse(support);

    if(!data?.message && !data?.file) return ctx.badRequest('Missing "message" parameter');
    const admin = isTrue(data?.admin) && user?.admin;
    if(!admin && ((support.user && support.user.id != user?.id) || (!support.user && user))) return ctx.badRequest('Support message not found');

    let from: number|undefined,to: number|undefined
    if(admin) {
      from = 1;
      if(user) to = user.id;
      if(data?.message) {
        data.message = linkEncode(data?.message);
      }
    } else {
      if(user) from = user.id;
      to = 1;
      if(data?.message) {
        data.message = specialHTML(data?.message);
      }
    }

    data = {
      room_id:support.id,
      message: data.message,
      type:'support',
      from,
      to,
      datetime: getDayJs().toDate(),
    }

    const msg = await strapi.entityService.create('api::message.message',{
      data,
      files,
      populate:{
        from:'*',
        to:'*',
        file:'*'
      }
    })

    await strapi.entityService.update('api::support.support',support.id,{
      data:{
        status: admin ? 'answered' : 'customer-reply'
      },
    })

    /*if(admin) {
      let txt="";
      if(msg.file) {
        txt+=`<center><img style="width:90%;" alt="images" src="${webUrl(msg.file.url)}" /></center><br />`
      }
      if(msg.message) {
        txt+=linkWrap(emailEncode(msg.message));
      }
      const text = htmlToText(txt,{
        wordwrap:false
      })

      await sendEmail({
        email:'support-sansorder',
        subject:`Support #${s.id}: ${s.subject}`,
        to:s.email,
        template:{
          type:'basicv2',
          option:{
            username:s.name,
            replyTo:true,
            header:"Support Update",
            button:{
              url:webUrl(`support/${s.id}`),
              label:'View Support'
            },
            footer:{
              extra:`You have received this service announcement to update you about your support ticket.`
            },
            messages:`${text}\n\n` + 
            `Name: ${s.name}\nEmail: ${s.email}\nStatus: answered`
          }
        }
      })
    }*/

    return this.transformResponse(msg);
  }
}));
