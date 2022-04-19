import {useEffect,useState} from 'react'
import io,{Socket as ISocket} from 'socket.io-client'
import {useAPI} from '@utils/portalnesia'
import { useRouter } from 'next/router';

let socket: ISocket|undefined=undefined;

export default function useSocket() {
  const {get} = useAPI();
  const [mySocket,setSocket] = useState<ISocket|undefined>(socket);

  useEffect(()=>{
    async function getSocket() {
        if(!socket && typeof window !== 'undefined') {
            try {
                const token = await get<string>("/internal/socket",{error_notif:false,success_notif:false});
                socket = io(`${process.env.API_URL}/v1?token=${token}`,{transports: ['websocket']});
                const reconnect=(soc: ISocket)=>()=>{
                    soc.emit("konek");
                }
                socket.emit("konek");
                socket.on('reconnect',reconnect(socket));
                setSocket(socket);
            } catch {
                
            }
        }
    }
    getSocket();
  },[get])

  return mySocket;
}

export function Socket() {
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const socket = useSocket();

  useEffect(()=>{
    if(typeof toko_id==='string' && typeof outlet_id==='string' && socket) {
      socket.emit('toko outlet',{toko_id,outlet_id})
    }
  },[toko_id,outlet_id,socket])

  return null;
}