import useSWRR,{SWRConfiguration,Fetcher} from "swr"
import {PortalnesiaError} from '@portalnesia/portalnesia-js'
import {useAPI} from './portalnesia'
<<<<<<< HEAD
import { useSelector,State } from "@redux/index";

export default function useSWR<D=any,F=PortalnesiaError>(path: string|null,config:SWRConfiguration={}){
    const {get} = useAPI();
    const {ready,appToken} = useSelector<Pick<State,'appToken'|'ready'>>(s=>({ready:s.ready,appToken:s.appToken}));
    
    const swr = useSWRR<D,F>(!ready||!appToken ? null : path,{
=======
import { useSelector } from "@redux/store";

export default function useSWR<D=any,F=PortalnesiaError>(path: string|null,config:SWRConfiguration={}){
    const {get} = useAPI();
    const loaded = useSelector<boolean>(s=>s.ready);
    const swr = useSWRR<D,F>(!loaded ? null : path,{
>>>>>>> main
        fetcher:get,
        revalidateOnReconnect:true,
        revalidateOnFocus:false,
        revalidateIfStale:true,
        ...config
    });
    return swr;
}