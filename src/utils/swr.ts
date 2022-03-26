import useSWRR,{SWRConfiguration,Fetcher} from "swr"
import {PortalnesiaError} from '@portalnesia/portalnesia-js'
import {useAPI} from './portalnesia'

export default function useSWR<D=any,F=PortalnesiaError>(path: string|null,config:SWRConfiguration={}){
    const {get} = useAPI();
    const swr = useSWRR<D,F>(path,{
        fetcher:get,
        revalidateOnReconnect:true,
        revalidateOnFocus:false,
        revalidateIfStale:true,
        ...config
    });
    return swr;
}