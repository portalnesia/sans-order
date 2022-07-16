export default {
  routes:[{
    method:'GET',
    path:'/tokos/:toko_slug/outlets',
    handler:'toko.findOutlets',
    config:{
      middlewares:['global::auth']
    }
  }]
}