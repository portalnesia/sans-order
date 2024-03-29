export default {
  prefix:'/products',
  routes:[
    {
      method:'GET',
      path:'/:outlet_id/menu/:category?',
      handler:'product.findMenu',
      config:{
        middlewares:['global::auth','api::outlet.outlet','api::outlet.subscription']
      }
    },
    {
      method:'GET',
      path:'/:outlet_id/cashier',
      handler:'product.findCashier',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Product',
            action:'view'
          }
        },'api::outlet.subscription']
      }
    },
    {
      method:'GET',
      path:'/:outlet_id/:id',
      handler:'product.findOne',
      config:{
        middlewares:['global::auth','api::outlet.outlet','api::outlet.subscription']
      }
    },{
      method:'PUT',
      path:'/:outlet_id/:id',
      handler:'product.update',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Product',
            action:'edit'
          }
        },'api::outlet.subscription']
      }
    },{
      method:'DELETE',
      path:'/:outlet_id/:id',
      handler:'product.delete',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Product',
            action:'delete'
          }
        },'api::outlet.subscription']
      }
    },{
      method:'POST',
      path:'/:outlet_id/bulk-delete',
      handler:'product.bulkDelete',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Product',
            action:'delete'
          }
        },'api::outlet.subscription']
      }
    },
    {
      method:'GET',
      path:'/:outlet_id',
      handler:'product.find',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Product',
            action:'view'
          }
        },'api::outlet.subscription']
      }
    },{
      method:'POST',
      path:'/:outlet_id',
      handler:'product.create',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Product',
            action:'add'
          }
        },'api::outlet.subscription']
      }
    }
  ]
}