import { useState,ReactNode,useEffect } from 'react';
// material
import { styled } from '@mui/material/styles';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import loadingImage from '@comp/loading-image-base64'
import useInitData from '@utils/init-data'
import {useSelector,State} from '@redux/index'
import {Socket} from '@utils/Socket';
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
  const {user,ready:loaded} = useSelector<Pick<State,'user'|'ready'>>(s=>({user:s.user,ready:s.ready}));
  const [open, setOpen] = useState(false);
  const {adBlock} = useInitData();

  return (
    <RootStyle>
      {(loaded===false||!user) && (
        <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
          <img style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
        </div>
      )}
      {user && (
        <>
          <Socket />
          <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
          <DashboardSidebar title={title} subtitle={subtitle} isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
          <MainStyle>
            {loaded && children}
          </MainStyle>
        </>
      )}
    </RootStyle>
  );
}
