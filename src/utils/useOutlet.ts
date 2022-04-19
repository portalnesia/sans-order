import { IOutlet } from '@type/toko'
import useSWR from './swr'

export default function useOutlet(toko_id?: any,outlet_id?: any) {
  const {data:outlet,error:errOutlet,mutate:mutateOutlet,...other} = useSWR<IOutlet>(typeof toko_id==='string' && typeof outlet_id === 'string' ? `/toko/${toko_id}/${outlet_id}` : null);
  return {outlet,errOutlet,mutateOutlet,...other}
}