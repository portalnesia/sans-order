/**
 * stock service.
 */

import { factories } from '@strapi/strapi';
import { Stock } from '../../../../types/Stock';

export default factories.createCoreService('api::stock.stock',({strapi}) => ({
  update(entityId: string, params: any = {}) {
    let { data } = params;
    data = {
      ...(data?.timestamp ? {
        timestamp: data.timestamp
      } : {})
    }
    return strapi.entityService.update<'api::stock.stock',Stock>('api::stock.stock', entityId, { ...params, data });
  }
}));
