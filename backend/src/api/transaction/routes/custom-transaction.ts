export default {
  prefix:'/transactions',
  routes:[
    {
      method:'GET',
      path:'/report/:token',
      handler:'transaction.report',
      config:{
        auth:false
      }
    },
    {
      method:'GET',
      path:'/print/:token',
      handler:'transaction.print',
      config:{
        auth:false
      }
    },
    {
      method:'GET',
      path:'/outlet/:outlet_id/report',
      handler:'transaction.generateReportToken',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Transaction',
            action:'view'
          }
        },'api::outlet.subscription']
      }
    },
    {
      method:'POST',
      path:'/outlet/:outlet_id',
      handler:'transaction.create',
      config:{
        middlewares:['global::auth',{
          name:'api::outlet.outlet',
          config:{
            populate:{
              bussiness_hour:'*',
              toko:{
                populate:{
                  user:'*',
                  wallet:'*'
                }
              },
            }
          }
        },'api::outlet.subscription']
      }
    },{
      method:'POST',
      path:'/outlet/:outlet_id/:id/pay',
      handler:'transaction.payTransaction',
      config:{
        middlewares:['global::auth',{
          name:'api::outlet.outlet',
          config:{
            populate:{
              bussiness_hour:'*',
              toko:{
                populate:{
                  user:'*',
                  wallet:'*'
                }
              },
            }
          }
        },'api::outlet.subscription']
      }
    },
    ...(process.env.PN_ENV==='production' ? [] : [{
      method:'POST',
      path:'/outlet/:outlet_id/simulation/:id',
      handler:'transaction.simulatePayment',
      config:{
        middlewares:['global::auth','api::outlet.outlet','api::outlet.subscription']
      }
    }]),
    {
      method:'GET',
      path:'/outlet/:outlet_id',
      handler:'transaction.find',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Transaction',
            action:'view'
          }
        },'api::outlet.subscription']
      }
    },
    {
      method:'GET',
      path:'/outlet/:outlet_id/pending',
      handler:'transaction.getPending',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Transaction',
            action:'view'
          }
        },'api::outlet.subscription']
      }
    },
    {
      method:'GET',
      path:'/outlet/:outlet_id/kitchen',
      handler:'transaction.getKitchen',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Transaction',
            action:'view'
          }
        },'api::outlet.subscription']
      }
    },
    {
      method:'PUT',
      path:'/outlet/:outlet_id/:id/status',
      handler:'transaction.updateTransactionOrderStatus',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Kitchen',
            action:'edit'
          }
        },'api::outlet.subscription']
      }
    },
    {
      method:'PUT',
      path:'/outlet/:outlet_id/:id/kitchen',
      handler:'transaction.updateTransactionKitchen',
      config:{
        middlewares:['global::auth','api::outlet.outlet',{
          name:'api::outlet.roles',
          config:{
            roles:'Kitchen',
            action:'view'
          }
        },'api::outlet.subscription']
      }
    },
    {
      method:'GET',
      path:'/:id',
      handler:'transaction.findOne',
      config:{
        middlewares:['global::auth']
      }
    }
  ]
}