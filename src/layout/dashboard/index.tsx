import { useState,ReactNode,useEffect, useRef } from 'react';
// material
import { styled } from '@mui/material/styles';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import loadingImage from '@comp/loading-image-base64'
import useInitData from '@utils/init-data'
import {useSelector,State} from '@redux/index'
import {ISocket, Socket} from '@utils/Socket';
import ForbiddenComp from '@comp/Forbidden';
import { ITransaction } from '@type/index';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
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
  subtitle?: string
}



export default function DashboardLayout({children,title,subtitle}: DashboardProps) {
  const {t} = useTranslation('common');
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const locale = router.locale||'en'
  const {user,ready:loaded} = useSelector<Pick<State,'user'|'ready'>>(s=>({user:s.user,ready:s.ready}));
  const [open, setOpen] = useState(false);
  const {adBlock} = useInitData();
  const [forb,setForb] = useState(false);
  const [socket,setSocket]=useState<ISocket>();


  useEffect(()=>{
    function onError() {
      setForb(true);
    }
    socket?.on('toko errors',onError);

    async function configNotification() {
      await Notification.requestPermission();
    }
    configNotification();
    return ()=>{
      socket?.off('toko errors',onError)
    }
  },[socket])

  useEffect(()=>{
    function onTransactions(dt: ITransaction) {
      const notification = new Notification(t('notification.new'),{body:t('notification.new_desc',{id:dt?.id}),lang:locale.toUpperCase()});
      notification.onclick = ()=>{
        window.open(`/toko/${toko_id}/${outlet_id}/order/self-order` , '_blank');
        notification.close();
      }
    }
    function onCashier(dt: ITransaction) {
      const notification = new Notification(t('notification.updated'),{body:t('notification.updated_desc',{id:dt?.id,method:dt?.payment}),lang:locale.toUpperCase()});
      notification.onclick = ()=>{
        window.open(`/toko/${toko_id}/${outlet_id}/order/self-order` , '_blank');
        notification.close();
      }
    }
    socket?.on('toko transactions',onTransactions);
    socket?.on('toko cashier',onCashier);

    return ()=>{
      socket?.off('toko transactions',onTransactions);
      socket?.off('toko cashier',onCashier);
    }
  },[socket,t,locale,toko_id,outlet_id])

  return (
    <>
      {forb ? <ForbiddenComp /> : (
        <RootStyle>
          <Socket dashboard onRef={setSocket} />
          {(loaded===false||!user||!socket) ? (
            <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
              <img style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
            </div>
          ) : user && socket ? (
            <>
              <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
              <DashboardSidebar title={title} subtitle={subtitle} isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
              <MainStyle>
                {loaded && children}
              </MainStyle>
            </>
          ) : null}
        </RootStyle>
      )}
    </>
  );
}
