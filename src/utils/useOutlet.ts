import { IOutlet } from '@type/toko'
import useSWR from './swr'
<<<<<<< HEAD
import qs from 'qs';

type OutletOptions = {
  with_wallet?: boolean;
}

export default function useOutlet(toko_id?: any,outlet_id?: any,opt?: OutletOptions) {
  const {data:outlet,error:errOutlet,mutate:mutateOutlet,...other} = useSWR<IOutlet>(typeof toko_id==='string' && typeof outlet_id === 'string' ? `/toko/${toko_id}/${outlet_id}${opt ? `?${qs.stringify(opt)}` : ''}` : null);
=======

export default function useOutlet(toko_id?: any,outlet_id?: any) {
  const {data:outlet,error:errOutlet,mutate:mutateOutlet,...other} = useSWR<IOutlet>(typeof toko_id==='string' && typeof outlet_id === 'string' ? `/toko/${toko_id}/${outlet_id}` : null);
>>>>>>> main
  return {outlet,errOutlet,mutateOutlet,...other}
}