import Portalnesia from '@portalnesia/portalnesia-strapi'
import {useSelector,State,useDispatch} from '@redux/index'
import { useCallback, useMemo } from 'react';
import type {AxiosError, AxiosRequestHeaders} from 'axios'
import {AxiosRequestConfig} from 'axios';

export type {PortalnesiaOptions} from '@portalnesia/portalnesia-strapi'

export const portalnesia = new Portalnesia({
  url:process.env.NEXT_PUBLIC_API_URL as string,
  store:{
    key:'sans_jwt'
  }
})


export function useAPI(useCache=true) {
  const dispatch = useDispatch();
  const appToken = useSelector<State['appToken']>(s=>s.appToken);
  const headers = useMemo(()=>{
    let headers: AxiosRequestHeaders|undefined;
    if(appToken) {
      headers={
        'x-app-token':appToken
      }
      return headers;
    }
    return undefined;
  },[appToken])

  const catchError=useCallback((url: string,err: any)=>{
    if(err?.response?.status) {
      const e = err as AxiosError
      if([500,503].includes(e.response?.status||0)) {
        url = `${portalnesia.url}${url}`;
        dispatch({type:'CUSTOM',payload:{report:{type:'url',url:window?.location?.href,endpoint:url}}})
      }
    }
  },[dispatch])

  const fetcher = useCallback(async(url: string)=>{
    const d = await portalnesia.request('get',url,{headers});
    return d.data;
  },[headers])

  const get=useCallback(<D=any, Pagination extends boolean = false>(url: string,opt?: AxiosRequestConfig)=>{
    return portalnesia.request<D,Pagination>('GET',url,{...opt,headers})
  },[headers])

  const del=useCallback(<D=any,Pagination extends boolean = false>(url: string,opt?: AxiosRequestConfig)=>{
    try {
      const response = portalnesia.request<D,Pagination>('delete',url,{...opt,headers})
      return response;
    } catch(e) {
      catchError(url,e)
      throw e
    }
  },[catchError,headers])

  const post=useCallback(<D,B=any,Pagination extends boolean = false>(url: string,data?:B,opt?: AxiosRequestConfig,wrapData: boolean=true)=>{
    try {
      const response = portalnesia.request<D,Pagination>('post',url,{...opt,headers,...(data ? {data:wrapData ? {data} : data} : {})})
      return response;
    } catch(e) {
      catchError(url,e)
      throw e
    }
  },[catchError,headers])

  const upload=useCallback(<D,B=any,Pagination extends boolean = false>(url: string,data?:B,opt?: AxiosRequestConfig)=>{
    try {
      const response = portalnesia.request<D,Pagination>('post',url,{...opt,headers:{...opt?.headers,...headers},data})
      return response;
    } catch(e) {
      catchError(url,e)
      throw e
    }
  },[catchError,headers])

  const put=useCallback(<D=any,B=any,Pagination extends boolean = false>(url: string,data?:B,opt?: AxiosRequestConfig,wrapData: boolean=true)=>{
    try {
      const response = portalnesia.request<D,Pagination>('put',url,{...opt,headers,...(data ? {data:wrapData ? {data} : data} : {})})
      return response;
    } catch(e) {
      catchError(url,e)
      throw e
    }
  },[catchError,headers])

  return {get,post,put,del,fetcher,upload}
}

export default portalnesia;
