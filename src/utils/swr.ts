import useSWRR,{SWRConfiguration,Fetcher} from "swr"
import {PortalnesiaError} from '@portalnesia/portalnesia-js'
import {useAPI} from './portalnesia'
import { useSelector } from "@redux/store";

export default function useSWR<D=any,F=PortalnesiaError>(path: string|null,config:SWRConfiguration={}){
    const {get} = useAPI();
    const loaded = useSelector<boolean>(s=>s.ready);
    const swr = useSWRR<D,F>(!loaded ? null : path,{
        fetcher:get,
        revalidateOnReconnect:true,
        revalidateOnFocus:false,
        revalidateIfStale:true,
        ...config
    });
    return swr;
}