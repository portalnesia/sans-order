import React, {useEffect} from 'react'
import io,{Socket as ISocket} from 'socket.io-client'
import portalnesia from '@utils/api'
import { useRouter } from 'next/router';
import { useSelector,State,useDispatch } from '@redux/index';

export type {ISocket}

let loading=false;
export default function useSocket() {
  const dispatch = useDispatch();
  const {appToken,socket} = useSelector<Pick<State,'appToken'|'socket'>>(s=>({appToken:s.appToken,socket:s.socket}));

  useEffect(()=>{
    function onConnection() {
      loading=false;
    }
    function onDisconnect() {
      loading=false;
    }
    async function getSocket() {
      if(!socket && typeof window !== 'undefined' && !loading && appToken) {
        loading=true;
        try {
          const token = portalnesia.getToken()?.jwt;
          const sockets = io(process.env.NEXT_PUBLIC_API_URL as string,{transports: ['websocket'],auth:{token}});
          sockets.once('connect',onConnection);
          sockets.once('disconnect',onDisconnect);

          dispatch({type:"CUSTOM",payload:{socket:sockets}});
        } catch {
          loading=false;
        }
      }
    }
    
    getSocket();
  },[appToken,dispatch,socket])

  return socket;
}

export function Socket({dashboard=false,view,onRef}: {dashboard?:boolean,view?:string,onRef?:(ref: ISocket)=>void}) {
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const socket = useSocket();

  useEffect(()=>{
    function onReconnect() {
      if(typeof toko_id==='string' && typeof outlet_id==='string') socket?.emit('outlet connection',{toko_id,outlet_id:Number(outlet_id),dashboard,view,debug:process.env.NEXT_PUBLIC_PN_ENV==='test'})
    }
    socket?.on('reconnect',onReconnect)
    socket?.on('connect',onReconnect)
    return ()=>{
      socket?.off('reconnect',onReconnect)
      socket?.off('connect',onReconnect)
    }
  },[toko_id,outlet_id,socket,dashboard,view])

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
export function withSocket<P extends object>(Component: React.ComponentType<P>,data?: {dashboard?:boolean,view?:string}): React.FC<P & ({socket:ISocket|null})> {
  // eslint-disable-next-line react/display-name
  return (props: P)=>{
    const socket = useSocket();
    const router = useRouter();
    const {toko_id,outlet_id} = router.query;
    const dashboard = !!data?.dashboard;

    useEffect(()=>{
      function onReconnect() {
        if(typeof toko_id==='string' && typeof outlet_id==='string') socket?.emit('outlet connection',{toko_id,outlet_id:Number(outlet_id),dashboard,view:data?.view,debug:process.env.NEXT_PUBLIC_PN_ENV==='test'})
      }
      socket?.on('reconnect',onReconnect)
      socket?.on('connect',onReconnect)

      return ()=>{
        socket?.off('reconnect',onReconnect)
        socket?.off('connect',onReconnect)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[toko_id,outlet_id,socket,dashboard,data])

    return <Component {...props as P} socket={socket} />
  }
}