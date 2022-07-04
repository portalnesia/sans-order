import useSWRR,{SWRConfiguration,Fetcher} from "swr"
import {PortalnesiaError} from '@portalnesia/portalnesia-js'
import {useAPI} from './portalnesia'
import { useSelector,State } from "@redux/index";

export default function useSWR<D=any,F=PortalnesiaError>(path: string|null,config:SWRConfiguration={}){
    const {get} = useAPI();
    const {ready,appToken} = useSelector<Pick<State,'appToken'|'ready'>>(s=>({ready:s.ready,appToken:s.appToken}));
    
    const swr = useSWRR<D,F>(!ready||!appToken ? null : path,{
        fetcher:get,
        revalidateOnReconnect:true,
        revalidateOnFocus:false,
        revalidateIfStale:true,
        ...config
    });
    return swr;
}

export function useDefaultSWR<D=any,E=any>(url: string|null,config: SWRConfiguration={}) {
    const {fetcher} = useAPI();
    const ready = useSelector<State['ready']>(s=>s.ready);

    const swr = useSWRR<D,E>(!ready ? null : url,{
        fetcher,
        revalidateOnReconnect:true,
        revalidateOnFocus:false,
        revalidateIfStale:true,
        ...config
    });
    return swr;
}