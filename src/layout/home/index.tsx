import { useState,ReactNode,useEffect } from 'react';
// material
import { styled } from '@mui/material/styles';
import HomeNavbar from './Navbar';
import Footer from './Footer'
import loadingImage from '@comp/loading-image-base64'
import useInitData from '@utils/init-data'
import { useSelector } from '@redux/store';



export const APP_BAR_MOBILE = 64;
export const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100vh',
  flexDirection:'column'
});

const MainStyle = styled('div')<{withPadding?:boolean}>(({ theme,withPadding=true }) => ({
  flexGrow: 1,
  minHeight: '100%',
  ...(withPadding ? {
    paddingTop: APP_BAR_MOBILE + 24,
    paddingBottom: theme.spacing(10),
  }:{}),
  [theme.breakpoints.up('lg')]: {
    ...(withPadding ? {
      paddingTop: APP_BAR_DESKTOP + 24,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    } : {})
  }
}));

export interface HomeProps {
  children: ReactNode
  withPadding?:boolean
  withNavbar?:boolean,
  withDashboard?: boolean
}

export default function HomeLayout({children,withPadding=true,withNavbar=true,withDashboard=true}: HomeProps) {
  const loaded = useSelector<boolean>(s=>s.ready);
  const {adBlock} = useInitData();
  
  return (
    <RootStyle>
      {loaded===false && (
        <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
          <img style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
        </div>
      )}
      <HomeNavbar withNavbar={withNavbar} withDashboard={withDashboard} />
      <MainStyle withPadding={withPadding}>
        {children}
      </MainStyle>
      <Footer />
    </RootStyle>
  );
}