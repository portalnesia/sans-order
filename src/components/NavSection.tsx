import { useState,useCallback,useMemo } from 'react';
import {useRouter} from 'next/router'
import Link from 'next/link'
//import PropTypes from 'prop-types';
//import { NavLink as RouterLink, matchPath, useLocation } from 'react-router-dom';
// material
import { alpha, useTheme, styled } from '@mui/material/styles';
import { Box, BoxProps, List, Collapse, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
//
import Iconify from './Iconify';

// ----------------------------------------------------------------------

const ListItemStyle = styled(ListItemButton)(
  ({ theme }) => ({
    ...theme.typography.body2,
    height: 48,
    position: 'relative',
    textTransform: 'capitalize',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(2.5),
    color: theme.palette.text.secondary,
    '&:before': {
      top: 0,
      right: 0,
      width: 3,
      bottom: 0,
      content: "''",
      display: 'none',
      position: 'absolute',
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      backgroundColor: theme.palette.primary.main
    }
  })
);

const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

// ----------------------------------------------------------------------

type IRootNavItems = {
  title: string,
  path: string,
  icon?: string|JSX.Element,
  info?: string,
}

type INavItems = IRootNavItems & ({
  children?: IRootNavItems[]
})

interface NavItemProps {
  item: INavItems,
  active(path?: string): boolean
};

function NavItem({ item, active }: NavItemProps) {
  const router = useRouter();
  const theme = useTheme();
  const isActiveRoot = active(item.path);
  const { title, path, icon, info, children } = item;
  const [open, setOpen] = useState(isActiveRoot);

  const handleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  },[setOpen]);

  const activeRootStyle = useMemo(()=>({
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    '&:before': { display: 'block' }
  }),[theme]);

  const activeSubStyle = useMemo(()=>({
    color: 'text.primary',
    fontWeight: 'fontWeightMedium'
  }),[]);

  if (children) {
    return (
      <>
        <ListItemStyle
          disableGutters
          onClick={handleOpen}
          sx={{
            ...(isActiveRoot && activeRootStyle)
          }}
        >
          <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
          <ListItemText disableTypography primary={title} />
          {info && info}
          <Iconify
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            sx={{ width: 16, height: 16, ml: 1 }}
          />
        </ListItemStyle>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((item) => {
              const { title, path } = item;
              const isActiveSub = active(path);

              return (
                <Link href={`/apps/${router.query?.toko_id}/${router.query?.outlet_id}${path}`} passHref>
                  <ListItemStyle
                    component='a'
                    disableGutters
                    key={title}
                    sx={{
                      ...(isActiveSub && activeSubStyle)
                    }}
                  >
                    <ListItemIconStyle>
                      <Box
                        component="span"
                        sx={{
                          width: 4,
                          height: 4,
                          display: 'flex',
                          borderRadius: '50%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'text.disabled',
                          transition: (theme) => theme.transitions.create('transform'),
                          ...(isActiveSub && {
                            transform: 'scale(2)',
                            bgcolor: 'primary.main'
                          })
                        }}
                      />
                    </ListItemIconStyle>
                    <ListItemText disableTypography primary={title} />
                  </ListItemStyle>
                </Link>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <Link href={`/apps/${router.query?.toko_id}/${router.query?.outlet_id}${path}`} passHref>
      <ListItemStyle
        component='a'
        disableGutters
        sx={{
          ...(isActiveRoot && activeRootStyle)
        }}
      >
        <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
        <ListItemText disableTypography primary={title} />
        {info && info}
      </ListItemStyle>
    </Link>
  );
}

export interface NavConfigProps extends BoxProps {
  navConfig: INavItems[]
};

export default function NavSection({ navConfig, ...other }: NavConfigProps) {
  const router = useRouter();
  const pathname = router.pathname
  const asPath = router.asPath

  const match = useCallback((path?: string) => {
    const a = (path ? path === '/' ? '/apps/[toko_id]/[outlet_id]' === pathname : new RegExp((path||'/'),'i').test(asPath) : false)
    return a;
  },[pathname,asPath]);

  return (
    <Box {...other}>
      <List disablePadding>
        {navConfig.map((item) => (
          <NavItem key={item.title} item={item} active={match} />
        ))}
      </List>
    </Box>
  );
}
