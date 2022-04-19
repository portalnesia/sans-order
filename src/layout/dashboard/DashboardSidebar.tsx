import { useEffect } from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router'
// material
import { styled } from '@mui/material/styles';
import { Box, Button, Drawer, Typography, Avatar, Stack } from '@mui/material';
// mocks_
//import account from '../../_mocks_/account';
// hooks
import useResponsive from '@comp/useResponsive';
<<<<<<< HEAD
import {useTranslation} from 'next-i18next'
=======
import {useTranslations} from 'next-intl'
>>>>>>> main
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
import sidebarConfig from './SidebarConfig';
import MenuQr from '@comp/MenuQr';
<<<<<<< HEAD
import footerMenu from '@layout/FooterConfig';
=======

>>>>>>> main
// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH
  }
}));

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12]
}));

export const FooterRoot = styled('div')(({theme})=>({
  WebkitBoxAlign:'stretch',
  WebkitBoxDirection:'normal',
  WebkitBoxOrient:'vertical',
  WebkitFlexBasis:'auto',
  WebkitFlexDirection:'column',
  WebkitFlexShrink:0,
  alignItems:'stretch',
  boxSizing:'border-box',
  display:'flex',
  flexBasis:'auto',
  flexDirection:'column',
  flexShrink:0,
  margin:0,
  marginBottom:15,
  padding:0,
  position:'relative',
  zIndex:0,
  '& a:hover':{
    textDecoration:'underline'
  },
  '& span':{
    overflowWrap:'break-word',
    lineHeight:1.3125,
    color:theme.palette.text.secondary,
    whiteSpace:'pre-wrap',
  }
}))

export const FooterMenu = styled('div')(({theme})=>({
  WebkitFlexDirection:'row',
  WebkitFlexWrap:'wrap',
  WebkitBoxDirection:'normal',
  WebkitBoxOrient:'horizontal',
  flexWrap:'wrap',
  flexDirection:'row',
  marginBottom:0,
  paddingLeft:theme.spacing(2),
  paddingRight:theme.spacing(2)
}))

export const FooterChild = styled('div')(({theme})=>({
  color:theme.palette.text.secondary,
  lineHeight:'20px',
  fontSize:13,
  overflowWrap:'break-word',
  margin:'2px 0',
  padding:0,
  paddingRight:10,
  whiteSpace:'pre-wrap',
}))

export const FooterAChild = styled('a')(({theme})=>({
  color:theme.palette.text.secondary,
  lineHeight:'20px',
  fontSize:13,
  overflowWrap:'break-word',
  margin:'2px 0',
  padding:0,
  paddingRight:10,
  whiteSpace:'pre-wrap',
}))


// ----------------------------------------------------------------------

export interface DashboardSidebarProps {
  isOpenSidebar: boolean,
  onCloseSidebar(): void,
  title?: string,
  subtitle?: string
};

<<<<<<< HEAD
export function MenuItem({data}: {data: ReturnType<typeof footerMenu>[number]}) {

  return (
    <>
      {data.link ? (
        <Link href={data.link} passHref>
          <FooterAChild>
            <span>{data.name}</span>
          </FooterAChild>
        </Link>
      ) : data.exlink ? (
        <FooterAChild href={data.exlink} target='blank' rel='nofollow noopener noreferrer'>
          <span>{data.name}</span>
        </FooterAChild>
      ) : null}
    </>
  )
}

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar, title, subtitle }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = router.pathname;
  const {t} = useTranslation('menu');
=======
export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar, title, subtitle }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = router.pathname;
  const t = useTranslations();
>>>>>>> main
  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo href='/apps' />
      </Box>

      {title && subtitle && (
        <Box sx={{ mb: 5, mx: 2.5 }}>
          <AccountStyle>
            {/*<Avatar src={account.photoURL} alt="photoURL" />*/}
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            </Box>
          </AccountStyle>
        </Box>
      )}

<<<<<<< HEAD
      <NavSection navConfig={sidebarConfig(t)} />
=======
      <NavSection navConfig={sidebarConfig(t,router)} />
>>>>>>> main

      <MenuQr />

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
<<<<<<< HEAD
        <FooterRoot>
          <FooterMenu>
            {footerMenu(t).map((f)=>(
              <MenuItem key={f.name} data={f} />
            ))}
          </FooterMenu>
        </FooterRoot>
        <FooterRoot>
          <FooterMenu>
            <FooterChild>
              <span {...({"xmlns:cc":"http://creativecommons.org/ns#","xmlns:dct":"http://purl.org/dc/terms/"})}>
                <a property="dct:title" rel="cc:attributionURL" href={process.env.URL}>SansOrder</a> © {(new Date().getFullYear())}
              </span>
            </FooterChild>
            <FooterChild><span>Powered by <a target='_blank' href={process.env.PORTAL_URL}>Portalnesia</a></span></FooterChild>
          </FooterMenu>
        </FooterRoot>
=======
        
>>>>>>> main
      </Box>
    </Scrollbar>
  );

  return (
    <RootStyle>
      {!isDesktop && (
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: DRAWER_WIDTH }
          }}
        >
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed'
            }
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}
