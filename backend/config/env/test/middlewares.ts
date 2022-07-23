import {env} from '@strapi/utils'

export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: false
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: env.array('CORS','*')
    }
  },
  {
    name:'strapi::poweredBy',
    config:{
      poweredBy:'Portalnesia <portalnesia.com>'
    }
  },
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public'
];
