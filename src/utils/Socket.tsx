import React, {useEffect,useState} from 'react'
import io,{Socket as ISocket} from 'socket.io-client'
import {useAPI} from '@utils/portalnesia'
import { useRouter } from 'next/router';
import { useSelector,State,useDispatch } from '@redux/index';

export type {ISocket}

let loading=false;
export default function useSocket() {
  const dispatch = useDispatch();
  const {appToken,socket} = useSelector<Pick<State,'appToken'|'socket'>>(s=>({appToken:s.appToken,socket:s.socket}));
  const {get} = useAPI();

  useEffect(()=>{
    async function getSocket() {
      if(!socket && typeof window !== 'undefined' && !loading && appToken) {
        loading=true;
        try {
          const token = await get<string>("/internal/socket");
          const socket = io(`${process.env.API_URL}/v1?token=${token}`,{transports: ['websocket']});
          const reconnect=(soc: ISocket)=>()=>{
            soc.emit("konek");
          }
          socket.emit("konek");
          socket.on('reconnect',reconnect(socket));
          dispatch({type:"CUSTOM",payload:{socket}});
          loading=false;
        } catch {
            
        }
      }
    }
    getSocket();
  },[get,appToken,dispatch])

  return socket;
}

export function Socket({dashboard=false,onRef}: {dashboard?:boolean,onRef?:(ref: ISocket)=>void}) {
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const socket = useSocket();

  useEffect(()=>{
    if(typeof toko_id==='string' && typeof outlet_id==='string' && socket) {
      socket.emit('toko outlet',{toko_id,outlet_id:Number(outlet_id),dashboard,debug:process.env.NODE_ENV!=='production'})
    }
  },[toko_id,outlet_id,socket,dashboard])

  useEffect(()=>{
    if(socket && onRef) {
      onRef(socket);
    }
  },[socket,onRef])

  return null;
}
//: React.FC<P & ({socket:ISocket})>
export function withSocket<P extends object>(Component: React.ComponentType<P>): React.FC<P & ({socket:ISocket})> {
  return (props: P)=>{
    const socket = useSocket();
    return <Component {...props as P} socket={socket} />
  }
}