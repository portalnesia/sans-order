/**
 *  blog controller
 */

import { truncate } from '@portalnesia/utils';
import { factories } from '@strapi/strapi'
import { sanitisizedPopulate } from '../../../utils/ctx';

export default factories.createCoreController('api::blog.blog',({strapi}) => ({
  async findOne(ctx) {
    const {id} = ctx.params;

    const blog = await strapi.entityService.findMany('api::blog.blog',{
      filters:{
        slug:{
          $eq: id
        },
      },
      publicationState:'live',
      populate:{
        image:'*',
        createdBy:'*'
      },
      limit:1
    })

    if(blog.length !== 1) return ctx.notFound('Blog not found');

    const picture = await strapi.entityService.findMany('plugin::users-permissions.user',{
      filters:{
        email:{
          $eq: blog[0]?.createdBy?.email
        }
      },
      limit:1
    });

    const result = {
      ...blog[0],
      createdBy:{
        name: `${blog[0].createdBy?.firstname}${blog[0].createdBy?.lastname ? ` ${blog[0].createdBy?.lastname}`:''}`,
        picture: picture?.[0]?.picture
      }
    }

    return this.transformResponse(result);
  },
  async find(ctx) {
    const populate = sanitisizedPopulate(ctx);
    populate.image = '*';
    populate.createdBy = '*';

    const page = ctx?.query?.page;
    const pageSize = ctx?.query.pageSize||ctx?.query.size

    const {results,pagination} = await strapi.entityService.findPage('api::blog.blog',{
      populate:populate,
      page,
      pageSize,
      sort:{publishedAt:'desc'}
    })

    const blogs = await Promise.all(results?.map(async(r)=>{
      const picture = await strapi.entityService.findMany('plugin::users-permissions.user',{
        filters:{
          email:{
            $eq: r?.createdBy?.email
          },
        },
        limit:1
      });

      return {
        ...r,
        text: truncate(r.text,300),
        createdBy:{
          name: `${r.createdBy?.firstname}${r.createdBy?.lastname ? ` ${r.createdBy?.lastname}`:''}`,
          picture: picture?.[0]?.picture
        }
      }
    }))

    return this.transformResponse(blogs,{pagination});
  }
}));
