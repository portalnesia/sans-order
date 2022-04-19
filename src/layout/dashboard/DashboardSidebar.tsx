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
import {useTranslations} from 'next-intl'
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
import sidebarConfig from './SidebarConfig';
import MenuQr from '@comp/MenuQr';

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

// ----------------------------------------------------------------------

export interface DashboardSidebarProps {
  isOpenSidebar: boolean,
  onCloseSidebar(): void,
  title?: string,
  subtitle?: string
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar, title, subtitle }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = router.pathname;
  const t = useTranslations();
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

      <NavSection navConfig={sidebarConfig(t,router)} />

      <MenuQr />

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
        
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
