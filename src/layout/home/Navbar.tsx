import {useState,useMemo,useCallback,useRef,useEffect} from 'react'
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, ListItemText,IconButton,MenuItem,useTheme,Typography } from '@mui/material';
import Button from '@comp/Button'
// components
import Link from 'next/link'
import Iconify from '../../components/Iconify';
import Logo from '@comp/Logo'
import navbarConfig from './NavbarConfig'
import MenuPopover from '@comp/MenuPopover';
import {useRouter} from 'next/router'
import LanguagePopover from '../LanguagePopover'
import {useTranslations} from 'next-intl'
import useResponsive from '@comp/useResponsive'
import {useSelector,State} from '@redux/index'
import AccountPopover from '../dashboard/AccountPopover';

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.default, 0.72)
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5)
  }
}));

const ListItemStyle = styled(Button)(
  ({ theme }) => ({
    ...theme.typography.body2,
    position: 'relative',
    textTransform: 'capitalize',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    color: theme.palette.text.primary
  })
);

type IRootNavItems = {
  title: string,
  path: string,
  icon?: string|JSX.Element,
  info?: string,
}

type INavItems = IRootNavItems & ({
  children?: IRootNavItems[]
})

interface HomeNavbarItemsProps {
  item: INavItems
}

function HomeNavbarItems({item}: HomeNavbarItemsProps) {
  const router = useRouter();
  const pathname = router.pathname

  const anchorRef = useRef(null);
  const theme = useTheme();
  const { title, path, children } = item;
  const [open, setOpen] = useState(false);

  const isActive = useMemo(() => {
    const a = (path ? path === '/' ? path === pathname : new RegExp((path||'/'),'i').test(pathname||'/') : false)
    return a;
  },[pathname,path]);

  const handleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  },[setOpen]);

  const activeRootStyle = useMemo(()=>({
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    '&:before': { display: 'block' }
  }),[theme]);

  if(children) {
    return (
      <>
        <ListItemStyle
          variant='text'
          ref={anchorRef}
          onClick={handleOpen}
          sx={{
            ...(open && activeRootStyle)
          }}
        >
          {title}
        </ListItemStyle>

        <MenuPopover
          open={open}
          onClose={handleOpen}
          anchorEl={anchorRef.current}
        >

        </MenuPopover>
      </>
    )
  }

  return (
    <Link href={path} passHref>
      <ListItemStyle
        size='medium'
        variant={isActive ? 'contained' : 'text'}
        sx={{
          ...(isActive ? {color:'#ffffff'} : {})
        }}
      >
        {title}
      </ListItemStyle>
    </Link>
  )
}

interface MobileNavItemProps {
  items: INavItems[]
}

function MobileNavItem({items}: MobileNavItemProps) {
  const router = useRouter();
  const pathname = router.pathname
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };


  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
            }
          })
        }}
      >
        <Iconify icon='eva:menu-fill' sx={{width: 24,height: 24}}/>
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        paperSx={{minWidth:'70%'}}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          {items.map((it)=>{
            if(it.children) return null;
            const isActive =(it.path ? it.path === '/' ? it.path === pathname : new RegExp((it.path||'/'),'i').test(pathname||'/') : false)
            return (
              <Link key={it.title} href={it.path} passHref>
                <MenuItem
                  component='a'
                  onClick={handleClose}
                  sx={{ typography: 'body2', py: 1, px: 2.5,mb:1,borderRadius:1,...(isActive ? {backgroundColor:'primary.main',color:'#ffffff'} : {}) }}
                >
                  {it.title}
                </MenuItem>
              </Link>
            )
          })}
        </Box>
      </MenuPopover>
    </>
  )
}

export interface HomeNavbarProps {
  withNavbar?: boolean
}

export default function HomeNavbar({withNavbar=true} : HomeNavbarProps) {
  const router = useRouter();
  const t = useTranslations();
  const user = useSelector<State['user']>(s=>s.user);
  const menuDesktop = useResponsive('up',722)
  const menuMobile = useResponsive('down',722);
  const textHidden1 = useResponsive('between',722,765);
  const textHidden2 = useResponsive('down',370);

  const navbar = useMemo(()=>navbarConfig(t),[t]);

  return (
    <RootStyle>
      <ToolbarStyle>
        <Box sx={{ pr:1,display: 'inline-flex' }}>
          <Logo />
        </Box>
        <Box sx={{display:textHidden1||textHidden2 ? 'none':'block'}}>
          <Link href='/' passHref><a style={{textDecoration:'none'}}>
            <Typography variant='h4' sx={{color: 'text.primary'}}>SansOrder</Typography>
          </a></Link>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {withNavbar ? (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {menuDesktop && navbar.map((n,i)=>(
              <HomeNavbarItems key={`navbar-${i}`} item={n} />
            ))}
            <LanguagePopover />
            {typeof user === 'undefined' ? (
              <Button loading />
            ) : typeof user === 'boolean' ? (
              <Button
                variant='contained'
                size='large'
                onClick={()=>router.push('/apps')}
                color='secondary'
              >
                {t("Menu.start")}
              </Button>
            ) : (
              <Button
                variant='contained'
                size='large'
                onClick={()=>router.push('/apps')}
                color='secondary'
              >
                {t("Menu.dashboard")}
              </Button>
            )}
            
            {menuMobile && (
              <MobileNavItem items={navbar} />
            )}
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LanguagePopover />
            <AccountPopover />
          </Stack>
        )}
      </ToolbarStyle>
    </RootStyle>
  )
}