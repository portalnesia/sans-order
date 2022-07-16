/**
 * toko service.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::toko.toko',({strapi}) => ({
  async delete(id,params={}) {
    const [toko] = await Promise.all([
      strapi.entityService.findOne('api::toko.toko',id,{populate:'outlets'})
    ])

    if(!toko) return;

    const files = await strapi.service('plugin::upload.upload').findMany({
      filters:{
        toko: {
          id: {
            $eq: id
          }
        }
      }
    })

    const task: Promise<any>[] = toko?.outlets.map((o)=>strapi.service('api::outlet.outlet').delete(o.id,{}));
    task.push(strapi.db.query('api::wallet.wallet').delete({
      where:{
        toko:{
          id:{
            $eq: id
          }
        }
      }
    }))
    task.concat(files?.map(f=>strapi.service('plugin::upload.upload').remove(f)))

    await Promise.all(task)

    const result = await strapi.entityService.delete('api::toko.toko',id,params)
    return result;
  }
}));
