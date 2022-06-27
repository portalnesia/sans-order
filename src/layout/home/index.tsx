import { ReactNode, useMemo } from 'react';
// material
import { styled } from '@mui/material/styles';
import {Portal, SxProps, Theme} from '@mui/material'
import HomeNavbar from './Navbar';
import Footer from './Footer'
import useInitData from '@utils/init-data'
import { useSelector } from '@redux/store';
import { LogoProps } from '@comp/Logo';
import BackToTop, { BackToTopProps } from '@comp/BackToTop';
import WhatsappWidget,{WhatsappWidgetProps} from '@comp/WhatsappWidget';
import { SplashScreen } from '@comp/Loader';


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
        <SplashScreen />
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