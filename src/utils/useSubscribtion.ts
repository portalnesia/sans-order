import { IProduct } from '@type/toko'
import useSWR from './swr'

export default function useSubscription(toko_id?: any,outlet_id?: any) {
  const {data:subs,error:errSubs,mutate:mutateSubs,...other} = useSWR<IProduct[]>(typeof toko_id==='string' && typeof outlet_id === 'string' ? `/sansorder/toko/${toko_id}/${outlet_id}` : null);
  return {subs,errSubs,mutateSubs,...other}
}