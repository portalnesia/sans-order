import useSWRR,{SWRConfiguration} from "swr"
import {useAPI} from './api'
import { useSelector,State } from "@redux/index";
import type { StrapiError, StrapiResponse } from "@portalnesia/portalnesia-strapi";
import type { Without } from "@type/general";

export type {SWRConfiguration};

export type CustomConfiguration<D> = Partial<Without<SWRConfiguration,'fallback'>> & ({
  fallback?:D
})

export default function useSWR<D=any,Pagination extends boolean = false,F=StrapiError>(path: string|null,config:CustomConfiguration<StrapiResponse<D,Pagination>> = {}){
    const {get} = useAPI();
    const {ready,appToken} = useSelector<Pick<State,'appToken'|'ready'>>(s=>({ready:s.ready,appToken:s.appToken}));
    const {fallback,fallbackData,...rest} = config
    const swr = useSWRR<StrapiResponse<D,Pagination>,F>(!ready||!appToken ? null : path,{
        fetcher:get,
        revalidateOnReconnect:true,
        revalidateOnFocus:false,
        revalidateIfStale:true,
        fallbackData:fallback||fallbackData,
        ...rest
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