/**
 * product service.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::product.product',({strapi}) => ({
  async findOne(id,params={}) {
    const data = await strapi.entityService.findOne('api::product.product',id,params);

    if(data) {
      if(data?.category === null) data.category = 'Uncategory'
    }

    return data;
  },
  async find(params={}) {
    const {results,pagination} = await super.find(params);

    const result = results.map(d=>({
      ...d,
      category: d?.category === null ? 'Uncategory' : d.category
    }));

    return {results:result,pagination}; 
  }
}));
