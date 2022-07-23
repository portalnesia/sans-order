/**
 * support service.
 */

import { factories } from '@strapi/strapi';
import type { Strapi } from '@strapi/strapi';
import { Support } from '../../../../types/Support';

const customSupportService = ({strapi}: {strapi: Strapi}) => ({
  parse(support: Support) {
    const {user,name,email,...rest} = support;
    return {
      ...rest,
      ...(user ? {
        userid:user.id,
        name:user.name,
        email:user.email,
        picture:user.picture
      } : {
        name:name as string,
        email:email as string
      })
    }
  }
})

export type SupportService = ReturnType<typeof customSupportService>

export default factories.createCoreService('api::support.support',customSupportService);
