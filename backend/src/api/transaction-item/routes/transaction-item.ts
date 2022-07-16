/**
 * transaction-item router.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::transaction-item.transaction-item',{
  config:{
    find:{
      middlewares:['global::auth']
    },
    findOne:{
      middlewares:['global::auth']
    },
    create:{
      middlewares:['global::auth']
    },
    update:{
      middlewares:['global::auth']
    },
    delete:{
      middlewares:['global::auth']
    }
  }
});
