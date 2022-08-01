import { Config } from '@type/index'
import useSWR,{CustomConfiguration} from './swr'
import { StrapiResponse } from '@portalnesia/portalnesia-strapi';

export default function useConfig(SWRConfig?: CustomConfiguration<StrapiResponse<Config,false>>) {
  const {data:config,error:errConfig,mutate:mutateConfig,...other} = useSWR<Config>(`/config`,{
    ...SWRConfig
  });
  return {config,errConfig,mutateConfig,...other}
}