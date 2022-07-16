import { Strapi } from "@strapi/strapi";
import { User } from "../../types/User";
import {Subcribe} from "../../types/Subcribe";
import {getDayJs} from '../../utils/Main'

async function checkTokoSubscription(strapi: Strapi,toko_admin?: User) {
  if(!toko_admin) return undefined;
  if(toko_admin.blocked) return undefined;
  const subs = await strapi.entityService.findMany<'api::subcribe.subcribe',Subcribe>('api::subcribe.subcribe',{
    limit:1,
    filters:{
      user:{
        id:{
          $eq: toko_admin.id
        }
      }
    },
    populate:['user']
  })
  if(subs.length === 0) return undefined;
  const date = getDayJs(subs[0].expired);
  if(getDayJs().isAfter(date)) return undefined;
  return subs[0];
}

export default checkTokoSubscription;