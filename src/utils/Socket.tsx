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
    const reconnect=(soc: ISocket)=>()=>{
      soc.emit("konek");
    }
    async function getSocket() {
      if(!socket && typeof window !== 'undefined' && !loading && appToken) {
        loading=true;
        try {
          const token = await get<string>("/internal/socket");
          const socket = io(`${process.env.API_URL}/v1`,{transports: ['websocket'],auth:{token}});
          
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

  React.useEffect(()=>{
    async function onConnectError(err: Error) {
      if (err.message === "invalid credentials" && socket) {
        const token = await get<string>("/internal/socket");
        // @ts-ignore
        socket.auth.token = token;
        socket.connect();
        socket.emit("konek");
      }
    }

    if(socket) socket.on('connect_error',onConnectError);

    return ()=>{
      if(socket) socket.off('connect_error',onConnectError);
    }
  },[socket,get])

  return socket;
}

export function Socket({dashboard=false,onRef}: {dashboard?:boolean,onRef?:(ref: ISocket)=>void}) {
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const socket = useSocket();

  useEffect(()=>{
    if(typeof toko_id==='string' && typeof outlet_id==='string' && socket) {
      socket.emit('toko outlet',{toko_id,outlet_id:Number(outlet_id),dashboard,debug:process.env.NEXT_PUBLIC_PN_ENV==='test'})
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

/**
 * Socket HOC Component
 */
export function withSocket<P extends object>(Component: React.ComponentType<P>,data?: {dashboard?:boolean}): React.FC<P & ({socket:ISocket|null})> {
  return (props: P)=>{
    const socket = useSocket();
    const router = useRouter();
    const {toko_id,outlet_id} = router.query;
    const dashboard = !!data?.dashboard;

    useEffect(()=>{
      if(typeof toko_id==='string' && typeof outlet_id==='string' && socket) {
        socket.emit('toko outlet',{toko_id,outlet_id:Number(outlet_id),dashboard,debug:process.env.NEXT_PUBLIC_PN_ENV==='test'})
      }
    },[toko_id,outlet_id,socket,dashboard])

    return <Component {...props as P} socket={socket} />
  }
}