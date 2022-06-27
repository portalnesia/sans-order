import { useState,ReactNode,useEffect, useRef } from 'react';
// material
import { styled } from '@mui/material/styles';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import useInitData from '@utils/init-data'
import {useSelector,State} from '@redux/index'
import {ISocket, Socket} from '@utils/Socket';
import ForbiddenComp from '@comp/Forbidden';
import { ITransaction } from '@type/index';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Alert, AlertTitle } from '@mui/material';
import { SplashScreen } from '@comp/Loader';
// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

// ----------------------------------------------------------------------

export interface DashboardProps {
  children: ReactNode,
  title?: string,
  subtitle?: string,
  view?: string,
  dashboard?: boolean
}



export default function DashboardLayout({children,title,subtitle,view,dashboard=true}: DashboardProps) {
  const {t} = useTranslation('common');
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const locale = router.locale||'en'
  const {user,ready:loaded} = useSelector<Pick<State,'user'|'ready'>>(s=>({user:s.user,ready:s.ready}));
  const [open, setOpen] = useState(false);
  const {adBlock} = useInitData();
  const [forb,setForb] = useState(false);
  const [socket,setSocket]=useState<ISocket>();
  const [socketError,setSocketError] = useState(false);


  useEffect(()=>{
    function onError() {
      setForb(true);
    }
    socket?.on('toko errors',onError);

    /*async function configNotification() {
      await Notification.requestPermission();
    }
    configNotification();*/
    return ()=>{
      socket?.off('toko errors',onError)
    }
  },[socket])

  useEffect(()=>{
    function onTransactions(dt: ITransaction) {
      if(dt.status === 'PENDING') {
        const notification = new Notification(t('notification.new'),{body:t('notification.new_desc',{id:dt?.id}),lang:locale.toUpperCase()});
        notification.onclick = ()=>{
          window.open(`/apps/${toko_id}/${outlet_id}/order/self-order` , '_blank');
          notification.close();
        }
      } else if(dt.status === 'PAID' && dt.order_status==='PROCESSING') {
        const notification = new Notification(t('notification.updated'),{body:t('notification.updated_desc',{id:dt?.id,method:dt?.payment}),lang:locale.toUpperCase()});
        notification.onclick = ()=>{
          window.open(`/apps/${toko_id}/${outlet_id}/order/self-order` , '_blank');
          notification.close();
        }
      }
      
    }
    function onDisconnect() {
      setSocketError(true)
    }
    function onReconnect() {
      setSocketError(false)
    }

    socket?.on('toko transactions',onTransactions);
    //socket?.on('toko cashier',onCashier);
    socket?.on('disconnect',onDisconnect);
    socket?.on('reconnect',onReconnect)

    return ()=>{
      socket?.off('toko transactions',onTransactions);
      //socket?.off('toko cashier',onCashier);
      socket?.off('disconnect',onDisconnect);
      socket?.off('reconnect',onReconnect)
    }
  },[socket,t,locale,toko_id,outlet_id])

  return (
    <>
      {forb ? <ForbiddenComp /> : (
        <RootStyle>
          <Socket dashboard={dashboard} onRef={setSocket} view={view} />
          {(loaded===false||!user||!socket) ? (
            <SplashScreen />
          ) : user && socket ? (
            <>
              <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
              <DashboardSidebar title={title} subtitle={subtitle} isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
              <MainStyle>
                {socketError && (
                  <Alert severity="error" sx={{mb:3}}>
                    <AlertTitle>Disconnected</AlertTitle>
                    The connection with the server was lost. Please restart your browser 
                  </Alert>
                )}
                {loaded && children}
              </MainStyle>
            </>
          ) : null}
        </RootStyle>
      )}
    </>
  );
}
