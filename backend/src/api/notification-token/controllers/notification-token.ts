/**
 *  notification-token controller
 */

import { factories } from '@strapi/strapi'
import { NotificationToken } from '../../../../types/NotificationToken';
import { getDayJs } from '../../../../utils/Main';

export default factories.createCoreController('api::notification-token.notification-token',({strapi}) => ({
  async create(ctx) {
    const user = ctx.state.user;
    const now = getDayJs();

    const token = ctx.request.body?.data?.token;
    if(typeof token !== 'string') return ctx.badRequest('Invalid `token` parameters');

    const check = await strapi.entityService.findMany('api::notification-token.notification-token',{
      filters:{
        token:{
          $eq: token
        }
      }
    })

    const data = {
      token,
      datetime: now.toDate(),
      ...(user ? {user:user.id} : {})
    }

    let result: NotificationToken;
    if(check.length > 0) {
      result = await strapi.entityService.update('api::notification-token.notification-token',check[0].id,{data});
    } else {
      result = await strapi.entityService.create('api::notification-token.notification-token',{data});
    }

    return this.transformResponse(result);
  }
}));
