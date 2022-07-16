import type { Strapi } from "@strapi/strapi";
import type { Context } from "koa";
import { Outlet } from "../../../../../types/Outlet";
import { User } from "../../../../../types/User";
import { url, webUrl } from "../../../../../utils/Main";
import { sanitisizedPopulate, sent404 } from "../../../../utils/ctx";
import sendEmail from "../../../../utils/send-email";

function getQuery(ctx: Context,outlet_id: string|number) {
  const populate=sanitisizedPopulate(ctx);
  populate.roles='*'
  populate.user = '*'
  return {
    ...ctx.query,
    filters:{
      outlet:{
        id:{
          $eq: outlet_id
        }
      }
    },
    populate
  }
}

const rolesArr = [
  "Outlet",
  "User",
  "Product",
  "Stock",
  "Ingredient",
  "Promo",
  "Transaction",
  "Kitchen"
]

const rolesToId = {
  Outlet:1,
  Product:2,
  User:3,
  Ingredient:4,
  Stock:5,
  Transaction:6,
  Kitchen:7,
  Promo:8
}

const OutletUsersControllers = ({strapi}: {strapi: Strapi}) => ({
  async findUser(ctx: Context) {
    const outlet = ctx.state.outlet as Outlet;

    ctx.query = getQuery(ctx,outlet.id);

    return await strapi.controller('api::outlet-user.outlet-user').find(ctx);
  },
  async findOneUser(ctx: Context) {
    const outlet = ctx.state.outlet as Outlet;

    ctx.query = getQuery(ctx,outlet.id);

    return await strapi.controller('api::outlet-user.outlet-user').find(ctx);
  },
  async createUser(ctx: Context) {
    try {
      const outlet = ctx.state.outlet as Outlet;

      if(typeof ctx?.request?.body?.data?.email !== 'string') return ctx.badRequest('Missing "email" parameters');

      const roles = ctx?.request?.body?.data?.roles
      if(!Array.isArray(roles)) return ctx.badRequest('Invalid "roles" parameters');

      if(roles.length === 0) return ctx.badRequest('Invalid "roles" parameters');
      for(const r of roles) {
        if(typeof r !== 'string') return ctx.badRequest('Invalid "roles" parameters');
        if(!rolesArr.includes(r)) return ctx.badRequest('Invalid "roles" name');
      }

      const us = await strapi.entityService.findMany('plugin::users-permissions.user',{
        fields:['id','email','username'],
        limit:1,
        filters:{
          email:{
            $eq: ctx.request.body.data.email
          }
        }
      })

      if(!us || us.length === 0) return ctx.notFound('"User" not found');

      ctx.request.body.data = {
        pending:true,
        roles: roles.map(r=>rolesToId[r]),
        user:{
          id:us[0].id
        },
        outlet:{
          id: outlet.id
        }
      }
      ctx.query = {
        ...ctx.query,
        populate:{
          roles:'*',
          user:'*'
        }
      }

      // SEND EMAIL
      const token = await strapi.plugins['users-permissions'].services.jwt.issue({email:us[0].email,outlet_id:outlet.id},{expiresIn:'1d'});
      const link = url(`/api/outlets/${outlet.id}/users/invitation/${token}`);

      const [data,_] = await Promise.all([
        strapi.controller('api::outlet-user.outlet-user').create(ctx),
        sendEmail({
          email:'noreply',
          subject:'[SansOrder] Merchant Invitation',
          to: us[0].email,
          template:{
            type:'basic',
            option:{
              username: us[0].username,
              header:'Merchant',
              messages:`${outlet?.toko?.name} invites you to be a part of its merchant.\n\n`+
              `Merchant name: ${outlet?.toko?.name}\n`+
              `Roles: ${roles.join(", ")}\n` + 
              `Owner: ${outlet?.toko?.user?.name}\n\n`+
              `Click the button below to accept this invitation`,
              button:{
                label:"Join Merchant",
                url:link,
                text:`Note:This link is only valid for one day. If it expires, You can ask the merchant owner to invite you back.\n\n`+
                `If we sent the email incorrectly, and you don't know anything about the merchant. Please ignore this email!`
              }
            }
          }
        })
      ])

      return data
    } catch(e) {
      console.log(e)
    }
  },
  async updateUser(ctx: Context) {    
    const roles = ctx.request.body.data.roles
    if(!Array.isArray(roles)) return ctx.badRequest('Invalid "roles" parameters');
    if(roles.length === 0) return ctx.badRequest('Invalid "roles" parameters');
    for(const r of roles) {
      if(typeof r === 'string') {
        if(!rolesArr.includes(r)) return ctx.badRequest('Invalid "roles" name');
      } else if(typeof r === 'object') {
        if(!rolesArr.includes(r?.name||"")) return ctx.badRequest('Invalid "roles.name" parameters');
      } else {
        return ctx.badRequest('Invalid "roles" parameters');
      }
    }

    ctx.request.body.data = {
      roles
    }
    ctx.query = {
      ...ctx.query,
      populate:{
        roles:'*',
        user:'*'
      }
    }

    return await strapi.controller('api::outlet-user.outlet-user').update(ctx);
  },
  async deleteUser(ctx: Context) {
    const outlet = ctx.state.outlet as Outlet;

    ctx.query = getQuery(ctx,outlet.id);

    return await strapi.controller('api::outlet-user.outlet-user').delete(ctx);
  },
  async acceptInvitation(ctx: Context) {
    try {
      const outlet = ctx.state.outlet as Outlet;

      const token = ctx.params?.token;

      const {email,outlet_id} = await strapi.plugins['users-permissions'].services.jwt.verify(token);

      if(outlet.id != outlet_id) return sent404(ctx);
      const us = await strapi.entityService.findMany('api::outlet-user.outlet-user',{
        fields:['id'],
        limit:1,
        filters:{
          user:{
            email:{
              $eq: email
            }
          },
          pending: {
            $eq: true
          }
        }
      })

      if(!us || us.length === 0) return ctx.notFound('"User" not found');

      await strapi.entityService.update('api::outlet-user.outlet-user',us[0].id,{
        data:{
          pending: false
        }
      })

      return ctx.redirect(webUrl(`/apps`));
    } catch(e) {
      return sent404(ctx);
    }
  }
})

export default OutletUsersControllers;