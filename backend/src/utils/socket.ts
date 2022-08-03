import type { Outlet } from "../../types/Outlet"
import type { User } from "../../types/User"
import type { Socket,RemoteSocket,Server } from 'socket.io'
import type {DefaultEventsMap} from 'socket.io/dist/typed-events'
import type {Strapi} from '@strapi/strapi'

type ISocketData = {
  user?: User
  outlet?: Outlet & ({debug?:boolean,dashboard?:boolean,view?:string})
}

export type CustomSocket = Socket<DefaultEventsMap,DefaultEventsMap,DefaultEventsMap,ISocketData>
export type CustomRemoteSocket = RemoteSocket<DefaultEventsMap,ISocketData>

export declare class IO {
  socket: Server
  emit<D>(model: string,entity: D): Promise<void>
  raw<D>(event: string,data: D,options?:{room?: string}): Promise<void>
}

export const socketEvents = [
  {
    name: "connection",
    handler: ({ strapi }: {strapi: Strapi}, socket: CustomSocket) => {
      strapi.log.info(`[io] new connection with id ${socket.id}`);
    },
  },{
    name: "disconnect",
    handler: async({ strapi,io,socket }: {strapi: Strapi,io: IO,socket:CustomSocket}) => {
      const outlet = socket.data.outlet;
      if(outlet && outlet?.dashboard) {
        io.socket.to(`outlet::${outlet.toko?.id}::${outlet.id}`).emit('toko closed',{...outlet});
      }
    },
  },
  {
    name: "check data",
    handler: async({ strapi,io,socket }: {strapi: Strapi,io: IO,socket:CustomSocket}, dt: any) => {
      socket.emit('check data',socket.data);
    }
  },
  {
    name: "outlet connection",
    handler: async({ strapi,io,socket }: {strapi: Strapi,io: IO,socket:CustomSocket}, dt: {outlet_id:number,dashboard?:boolean,debug?:boolean,view?:string}) => {
      try {
        const sockets = (await io.socket.fetchSockets()) as CustomRemoteSocket[];
        const soc = sockets.find(s=>s.id !== socket.id && s.data.outlet?.dashboard && s.data.outlet?.id === dt.outlet_id);

        if(dt.dashboard) {
          if(soc) {
            socket.emit('outlet errors',{...dt});
            return;
          }
        }

        if(socket.data.outlet) {
          const outlet = socket.data.outlet;
          const {view:_,dashboard:__,debug:___,...rest} = outlet;
          if(outlet.toko && outlet.id === dt.outlet_id) {
            socket.data.outlet = {...outlet,dashboard:dt.dashboard,debug:dt.debug,view:dt.view}
            if(dt.dashboard) {
              // Notify user bahwa toko buka
              io.socket.to(`outlet::${outlet.toko.id}::${outlet.id}`).emit('toko open',{...rest});
              socket.emit("outlet registered");
            } else {
              const opened = !!soc;
              socket.emit("outlet registered",{opened});
            }
            return;
          } else {
            if(outlet.toko) socket.leave(`outlet::${outlet.toko.id}::${outlet.id}`)
          }
        }
        
        const outlet = await strapi.entityService.findOne<'api::outlet.outlet',Outlet>('api::outlet.outlet',dt.outlet_id,{populate:'toko'});
        if(outlet && outlet.toko) {
          socket.data.outlet = {...outlet,dashboard:dt.dashboard,debug:dt.debug,view:dt.view}
          socket.join(`outlet::${outlet.toko.id}::${outlet.id}`)
          if(dt.dashboard) {
            // Notify user bahwa toko buka
            io.socket.to(`outlet::${outlet.toko.id}::${outlet.id}`).emit('toko open',{...outlet});
            socket.emit("outlet registered");
          } else {
            const opened = !!soc;
            socket.emit("outlet registered",{opened});
          }
        } else {
          socket.emit('outlet errors',{message:'Outlet not found',data:dt})
        }
      } catch(e) {
        console.log("SOCKET ERROR",e)
        socket.emit('outlet errors',{message:e?.message||""})
      }
    },
  },
]