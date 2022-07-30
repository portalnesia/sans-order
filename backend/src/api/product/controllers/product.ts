/**
 *  product controller
 */

import { factories } from '@strapi/strapi'
import { Outlet } from '../../../../types/Outlet';
import { Product } from '../../../../types/Product';
import { getDayJs } from '../../../../utils/Main';

export default factories.createCoreController('api::product.product',({strapi}) => ({
  async create(ctx) {
    const outlet = ctx.state.outlet as Outlet;

    /**
     * Check user = yang punya toko
     */
    // @ts-ignore
    (ctx.request.body.data||{}).outlet = outlet.id;

    return await super.create(ctx);
  },
  async findOne(ctx) {
    const outlet = ctx.state.outlet as Outlet;

    ctx.query = {
      ...ctx.query,
      filters:{
        ...ctx.query.filters,
        outlet:{
          id:{
            $eq: `${outlet?.id}`
          }
        }
      }
    }

    return await super.findOne(ctx)
  },
  async findMenu(ctx) {
    const outlet = ctx.state.outlet as Outlet;
    const now = getDayJs();
    const category = ctx.params?.category

    ctx.query = {
      ...ctx.query,
      populate:{
        ...(ctx.query?.populate||{}),
        promo:{
          filters:{
            $and: [{
              active:{
                $eq: true
              }
            },{
              from:{
                $lte: now.pn_format()
              }
            },{
              to:{
                $gte: now.pn_format()
              }
            }],
          }
        },
        image:{
          populate:'*',
          fields:['id','url']
        }
      }
    }
    const populate= {
      ...ctx.query.populate,
      image:{
        populate:'*',
        fields:['id','url']
      },
      promo:{
        image:{
          populate:'*',
          fields:['id','url']
        }
      }
    }

    if(typeof category === 'string') {
      const filters = {
        ...ctx.query.filters,
        category:{
          ...(category.toLowerCase() == 'uncategory' ? {
            $null: true
          } : {
            $eq: category
          })
        },
        show_in_menu:{
          $eq:true
        },
        outlet:{
          id:{
            $eq: `${outlet?.id}`
          }
        },
      }
      const pr = await strapi.entityService.findPage('api::product.product',{filters,populate})
      
      return {data:[{category:category,data:pr.results}],meta:{pagination:pr.pagination}};
    } else if(typeof category === 'undefined') {
      const data: {category: string,data: Product[]}[] = []

      const {results:pr} = await strapi.service('api::product.product').find({filters:{
        ...ctx.query.filters,
        $and:[{
          category:{
            $null: true
          }
        },{
          outlet:{
            id:{
              $eq: `${outlet?.id}`
            }
          }
        },{
          show_in_menu:{
            $eq:true
          }
        }],
      },populate})
      if(pr.length > 0) data.push({category:'Uncategory',data:pr});

      const cat = await strapi.db.query('api::product.product').findPage({
        groupBy:['category']
      })

      for(const c of cat.results) {
        if(c.category === null) continue;
        const filters = {
          ...ctx.query.filters,
          $and:[{
            category:{
              $eq: c.category
            }
          },{
            category:{
              $notNull: true
            }
          },{
            outlet:{
              id:{
                $eq: `${outlet?.id}`
              }
            }
          },{
            show_in_menu:{
              $eq:true
            }
          }]
        }
        const pr = await strapi.entityService.findMany('api::product.product',{filters,populate})

        data.push({category:c.category||'',data:pr});
      }
      
      return {data,meta:{pagination:cat.pagination}}
    }
  },
  async findCashier(ctx) {
    const outlet = ctx.state.outlet as Outlet;

    const now = getDayJs();
    ctx.query = {
      ...ctx.query,
      filters:{
        ...ctx.query.filters,
        outlet:{
          id:{
            $eq: `${outlet?.id}`
          }
        },
        active:{
          $eq:true
        }
      },
      populate:{
        ...(ctx.query?.populate||{}),
        promo:{
          filters:{
            $and: [{
              active:{
                $eq: true
              }
            },{
              from:{
                $lte: now.pn_format()
              }
            },{
              to:{
                $gte: now.pn_format()
              }
            }],
          }
        },
        image:{
          populate:'*',
          fields:['id','url']
        }
      }
    }

    return super.find(ctx);
  },
  async find(ctx) {
    const outlet = ctx.state.outlet as Outlet;

    ctx.query = {
      ...ctx.query,
      filters:{
        ...ctx.query.filters,
        outlet:{
          id:{
            $eq: `${outlet?.id}`
          }
        }
      },
      populate:{
        image:{
          populate:'*',
          fields:['id','url']
        },
        recipes:{
          populate:'*'
        }
      }
    }
    const output =  await super.find(ctx)
    
    return output;
  },
  async update(ctx) {
    try {
      const outlet = ctx.state.outlet as Outlet;
      (ctx.request.body.data||{}).outlet = outlet.id;
      return await super.update(ctx);
    } catch(e) {
      console.log(e)
    }
  },
  async bulkDelete(ctx) {
    const outlet = ctx.state.outlet as Outlet;
    const filter = ctx.request.body?.data?.filters;
    if(!Array.isArray(filter)) return ctx.badRequest('Invalid "filters" parameter');

    filter.forEach(f=>{
      if(typeof f !== 'number') {
        return ctx.badRequest('Invalid "filters" parameter');
      }
    })
    
    const where = {
      $and:[{
        id:{
          $in: filter
        }
      },{
        outlet:{
          id:{
            $eq: outlet.id
          }
        }
      }]
    }

    await strapi.db.query('api::product.product').delete({
      where
    })

    return this.transformResponse({ok:true});
  }
}));
