import {useEffect,useState} from 'react'
import io,{Socket} from 'socket.io-client'
import {useAPI} from '@utils/portalnesia'

let socket: Socket|undefined=undefined;

export default function useSocket() {
  const {get} = useAPI();
  const [mySocket,setSocket] = useState<Socket|undefined>(socket);

  useEffect(()=>{
    async function getSocket() {
        if(!socket && typeof window !== 'undefined') {
            try {
                const [token] = await get<string>("/v1/internal/socket",{error_notif:false,success_notif:false});
                socket = io(`${process.env.API_URL}/v1?token=${token}`,{transports: ['websocket']});
                const reconnect=(soc: Socket)=>()=>{
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