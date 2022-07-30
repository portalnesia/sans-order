export default {
  routes:[{
    method:'GET',
    path:'/outlets/:outlet_id/insight',
    handler:'outlet.graph',
    config:{
      middlewares:['global::auth','api::outlet.outlet']
    }
  },{
    method:'GET',
    path:'/outlets/:outlet_id/payments',
    handler:'outlet.getPayment',
    config:{
      middlewares:['global::auth','api::outlet.outlet']
    }
  }]
}