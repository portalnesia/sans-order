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
      origin: ['http://localhost:3503']
    }
  },
  'global::firebase',
  {
    name:'strapi::poweredBy',
    config:{
      poweredBy:'Portalnesia <portalnesia.com>'
    }
  },
  ...(process.env.NODE_ENV === 'production' ? [] : ['strapi::logger']),
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public'
];
