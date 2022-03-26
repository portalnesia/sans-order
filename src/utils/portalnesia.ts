import Portalnesia,{IScopes} from '@portalnesia/portalnesia-js'
import {useSelector,State} from '@redux/index'
import { useCallback } from 'react';
export const scope = ['toko','toko-write','payment','payment-write','basic','email','openid'] as IScopes[];

export type {ResponseData,ResponsePagination} from '@portalnesia/portalnesia-js'

const portalnesia = new Portalnesia({
  client_id:process.env.NEXT_PUBLIC_CLIENT_ID as string,
  redirect_uri:`${process.env.URL}/apps`,
  scope,
  request:{
    headers:{
      'X-Debug':process.env.NEXT_PUBLIC_X_DEBUG as string,
    }
  }
})

export function useAPI() {
  const appToken = useSelector<State['appToken']>(s=>s.appToken);

  const get=useCallback(<D=any,B=any>(url: string)=>{
    return portalnesia.request<D,B>('get',url,undefined,{"X-App-Token":appToken||""},true)
  },[appToken])

  const del=useCallback(<D=any,B=any>(url: string)=>{
    return portalnesia.request<D,B>('delete',url,undefined,{"X-App-Token":appToken||""},true)
  },[appToken])

  const post=useCallback(<D=any,B=any>(url: string,body?:B)=>{
    return portalnesia.request<D,B>('post',url,body,{"X-App-Token":appToken||""},true)
  },[appToken])

  const put=useCallback(<D=any,B=any>(url: string,body?:B)=>{
    return portalnesia.request<D,B>('put',url,body,{"X-App-Token":appToken||""},true)
  },[appToken])

  return {get,post,put,del}
}

export default portalnesia;
