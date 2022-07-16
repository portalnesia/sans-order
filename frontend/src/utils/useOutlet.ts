import { Outlet } from '@type/index'
import useSWR,{CustomConfiguration} from './swr'
import { StrapiResponse } from '@portalnesia/portalnesia-strapi';

type Options = {
  withWallet?: boolean
}

export default function useOutlet(outlet_id?: any,SWRConfig?: CustomConfiguration<StrapiResponse<Outlet,false>>,opt?:Options) {
  const {data:outlet,error:errOutlet,mutate:mutateOutlet,...other} = useSWR<Outlet>(typeof outlet_id === 'string' ? `/outlets/${outlet_id}${opt?.withWallet ? '?with_wallet=true' : ''}` : null,SWRConfig);
  return {outlet,errOutlet,mutateOutlet,...other}
}