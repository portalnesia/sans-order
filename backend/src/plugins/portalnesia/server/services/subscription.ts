import { Strapi } from "@strapi/strapi"
import { Subcribe } from "../../../../../types/Subcribe";
import { User } from "../../../../../types/User";
import {getDayJs} from '../../../../../utils/Main'

const subcription = ({strapi}: {strapi: Strapi}) => ({
  async checkTokoSubscription(toko_admin: User) {
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
    if(date.isAfter(getDayJs())) return undefined;
    return subs[0];
  }
})

export default subcription;