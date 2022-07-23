/**
 *  blog controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::blog.blog',({strapi}) => ({
  async findOne(ctx) {
    const {id} = ctx.params;

    const blog = await strapi.entityService.findMany('api::blog.blog',{
      filters:{
        slug:{
          $eq: id
        }
      },
      publicationState:'live',
      limit:1
    })

    if(blog.length !== 1) return ctx.notFound('Blog not found');

    const sanitizedEntity = await this.sanitizeOutput(blog, ctx);
    return this.transformResponse(sanitizedEntity);
  }
}));
