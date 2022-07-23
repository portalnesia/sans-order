/**
 * outlet service.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::outlet.outlet',({strapi}) => ({
  async delete(id,params={}) {
    try {
      await Promise.all([
        strapi.db.query('api::product.product').delete({
          where:{
            outlet:{
              id:{
                $eq: id
              }
            }
          }
        }),
        strapi.db.query('api::ingredient.ingredient').delete({
          where:{
            outlet:{
              id:{
                $eq: id
              }
            }
          }
        }),
        strapi.db.query('api::stock.stock').delete({
          where:{
            outlet:{
              id:{
                $eq: id
              }
            }
          }
        }),
        strapi.db.query('api::transaction-item.transaction-item').delete({
          where:{
            outlet:{
              id:{
                $eq: id
              }
            }
          }
        }),
        strapi.db.query('api::transaction.transaction').delete({
          where:{
            outlet:{
              id:{
                $eq: id
              }
            }
          }
        }),
        strapi.db.query('api::promo.promo').delete({
          where:{
            outlet:{
              id:{
                $eq: id
              }
            }
          }
        })
      ])
    } catch(e) {
      console.log(e)
    }
    
    const result = await strapi.entityService.delete('api::outlet.outlet',id,params)
    return result
  }
}));