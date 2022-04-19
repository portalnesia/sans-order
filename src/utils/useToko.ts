import { IToko } from '@type/toko'
import useSWR from './swr'

export default function useToko(toko_id?: any) {
  const {data:toko,error:errToko,mutate:mutateToko,...other} = useSWR<IToko>(typeof toko_id==='string' ? `/toko/${toko_id}` : null);
  return {toko,errToko,mutateToko,...other}
}