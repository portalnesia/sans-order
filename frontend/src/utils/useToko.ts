import { Toko } from '@type/index'
import useSWR,{CustomConfiguration} from './swr'
import { StrapiResponse } from '@portalnesia/portalnesia-strapi';

export default function useToko(toko_id?: any,SWRConfig?: CustomConfiguration<StrapiResponse<Toko,false>>) {
  const {data:toko,error:errToko,mutate:mutateToko,...other} = useSWR<Toko>(typeof toko_id==='string' ? `/tokos/${toko_id}` : null,SWRConfig);
  return {toko,errToko,mutateToko,...other}
}