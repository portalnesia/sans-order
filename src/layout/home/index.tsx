import { useState,ReactNode,useEffect, useMemo } from 'react';
// material
import { styled } from '@mui/material/styles';
import {Box, CircularProgress, Portal, SxProps, Theme} from '@mui/material'
import HomeNavbar from './Navbar';
import Footer from './Footer'
import loadingImage from '@comp/loading-image-base64'
import useInitData from '@utils/init-data'
import { useSelector } from '@redux/store';
import { LogoProps } from '@comp/Logo';
import BackToTop, { BackToTopProps } from '@comp/BackToTop';
import WhatsappWidget,{WhatsappWidgetProps} from '@comp/WhatsappWidget';


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
  logoProps?: LogoProps,
  backToTop?: BackToTopProps,
  whatsappWidget?: WhatsappWidgetProps,
  withFooter?: boolean,
  sx?: SxProps<Theme>
}

export default function HomeLayout({children,withFooter=true,withPadding=true,withNavbar=true,withDashboard=true,logoProps,backToTop,whatsappWidget,sx}: HomeProps) {
  const loaded = useSelector<boolean>(s=>s.ready);
  const {adBlock} = useInitData();

  const bt = useMemo(()=>{
    const bbt: BackToTopProps = {
      enabled: true,
      ...backToTop
    }
    return bbt;
  },[backToTop])

  return (
    <RootStyle>
      {loaded===false && (
        <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
          <img style={{position:'fixed',top:'40%',left:'50%',transform:'translate(-40%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
          <Box position='fixed' top='70%' left='52%' sx={{transform:'translate(-70%,-52%)'}}>
            <CircularProgress size={75} sx={{color:'white'}} />
          </Box>
        </div>
      )}
      <HomeNavbar logoProps={logoProps} withNavbar={withNavbar} withDashboard={withDashboard} />
      <MainStyle withPadding={withPadding} sx={sx}>
        {children}
      </MainStyle>
      {withFooter && <Footer /> }
      <Portal>
        <BackToTop {...bt} />
        <WhatsappWidget {...whatsappWidget} />
      </Portal>
    </RootStyle>
  );
}