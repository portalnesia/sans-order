/**
 * transaction service.
 */

import { factories } from '@strapi/strapi';
import { Service } from '@strapi/strapi/lib/core-api/service';
import { Transaction } from '../../../../types/Transaction';
import { getDayJs } from '../../../../utils/Main';
import Payment from '../../../utils/payment';
import paymentServices from './payment';

export type TrServices = {
  payment: Payment,
  parseUser(tr: Transaction): Transaction
}

export default factories.createCoreService('api::transaction.transaction', ({strapi}) => {
  const payment = paymentServices(strapi);

  return {
    payment,
    parseUser(tr: Transaction) {
      const {name,email,telephone,user:dUser,...rest} = tr;
      const datas = {
        ...rest,
        user: dUser ? {
          name: dUser.name,
          email: dUser.email,
          telephone: dUser.telephone
        } : {
          name,
          email,
          telephone
        }
      }
      return datas;
    },
    async findOne(id,params={}) {
      params.populate = {
        ...params.populate,
        user:'*',
        cashier:'*',
        toko:{
          populate:'user'
        }
      }

      const d = await strapi.entityService.findOne('api::transaction.transaction',id,params);
  
      const {name,email,telephone,user:dUser,...rest} = d;
  
      const data = {
        ...d,
        user: dUser ? {
          name: dUser.name,
          email: dUser.email,
          telephone: dUser.telephone
        } : {
          name,
          email,
          telephone
        },
      }

      return data;
    },
    async find(params={}) {
      params.populate = {
        ...params.populate,
        outlet:{
          populate:{
            toko:{
              populate:'user'
            }
          }
        },
        items:{
          populate:{
            item:{
              populate:{
                recipes:{
                  populate:'*'
                }
              }
            }
          }
        },
        cashier:'*',
        user:'*'
      }
      const {results,pagination} = await super.find(params);
  
      const result = results.map(d=>{
        const {name,email,telephone,user:dUser,...rest} = d;
        return {
          ...d,
          user: dUser ? {
            name: dUser.name,
            email: dUser.email,
            telephone: dUser.telephone
          } : {
            name,
            email,
            telephone
          },
        }
      });
  
      return {results:result,pagination}; 
    },
    async delete(id,params={}) {
      await Promise.all([
        strapi.db.query('api::transaction-item.transaction-item').delete({
          where:{
            transaction:{
              id:{
                $eq: id
              }
            }
          }
        }),
      ])

      const result = await strapi.entityService.delete('api::transaction.transaction',id,params)
  
      return result;
    },
    async update(id,params) {
      params = {
        data:{
          ...(params?.data||{}),
          updated: getDayJs().toDate()
        }
      }

      return await strapi.entityService.update('api::transaction.transaction',id,params);
    }
  }
});
