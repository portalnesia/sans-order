export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/:toko_id',
      handler: 'content-api.upload',
    },
    {
      method: 'GET',
      path: '/files/:toko_id',
      handler: 'content-api.find',
    },
    {
      method: 'GET',
      path: '/files/:toko_id/:id',
      handler: 'content-api.findOne',
    },
    {
      method: 'DELETE',
      path: '/files/:toko_id/:id',
      handler: 'content-api.destroy',
    },
  ],
};