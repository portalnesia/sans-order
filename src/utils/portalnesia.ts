import Portalnesia,{IScopes} from '@portalnesia/portalnesia-js'
import {useSelector,State} from '@redux/index'
import { useCallback, useRef,useEffect } from 'react';
import type {AxiosAdapter} from 'axios'
import {setupCache} from 'axios-cache-adapter'

export const scope = ['toko','toko-write','payment','payment-write','basic','email','openid','files','files-write'] as IScopes[];

export type {ResponseData,ResponsePagination} from '@portalnesia/portalnesia-js'

const portalnesia = new Portalnesia({
  client_id:process.env.NEXT_PUBLIC_CLIENT_ID as string,
  redirect_uri:`${process.env.URL}/apps`,
  scope,
  axios:{
    headers:{
      'X-Debug':process.env.NEXT_PUBLIC_X_DEBUG as string,
    }
  }
})

export async function getAxiosCache() {
  const localforage = (await import('localforage')).default
  const memoryDriver = (await import('localforage-driver-memory')).default;

  await localforage.defineDriver(memoryDriver);

  const forageStore = localforage.createInstance({
      driver:[
          localforage.INDEXEDDB,
          localforage.LOCALSTORAGE,
          memoryDriver._driver
      ],
      name:'http-cache'
  })

  const cache = setupCache({
      maxAge:5*60*1000,
      store:forageStore
  })

  return cache;
}

export function useAPI(useCache=true) {
  const appToken = useSelector<State['appToken']>(s=>s.appToken);
  const adapter = useRef<AxiosAdapter>();

  useEffect(()=>{
    if(useCache) {
      (async function(){
        const cache = await getAxiosCache();
        adapter.current = cache.adapter;
      })
  }
  },[useCache])

  const get=useCallback(<D=any,B=any>(url: string,opt?: any)=>{
    return portalnesia.request<D,B>('get',url,undefined,{...opt,...(useCache ? {adapter:adapter.current} : {}),headers:{"X-App-Token":appToken||""}},{force:true,autoRefreshToken:true})
  },[appToken])

  const del=useCallback(<D=any,B=any>(url: string,opt?: any)=>{
    return portalnesia.request<D,B>('delete',url,undefined,{...opt,headers:{"X-App-Token":appToken||""}},{force:true,autoRefreshToken:true})
  },[appToken])

  const post=useCallback(<D=any,B=any>(url: string,body?:B,opt?: any)=>{
    return portalnesia.request<D,B>('post',url,body,{...opt,headers:{"X-App-Token":appToken||""}},{force:true,autoRefreshToken:true})
  },[appToken])

  const put=useCallback(<D=any,B=any>(url: string,body?:B,opt?: any)=>{
    return portalnesia.request<D,B>('put',url,body,{...opt,headers:{"X-App-Token":appToken||""}},{force:true,autoRefreshToken:true})
  },[appToken])

  const upload = useCallback(<D=any>(url: string,body?:FormData,opt?: any)=>{
    return portalnesia.upload<D>(url,body,{...opt,headers:{"X-App-Token":appToken||""}})
  },[appToken])

  return {get,post,put,del,upload}
}

export default portalnesia;
