/**
 * outlet router.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::outlet.outlet',{
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
