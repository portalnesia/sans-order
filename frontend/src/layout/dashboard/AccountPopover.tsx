import { useRef, useState,useCallback } from 'react';
import Link from 'next/link';
// material
import { alpha } from '@mui/material/styles';
import { Button, Box, Divider, MenuItem, Typography, IconButton } from '@mui/material';
// components
import Avatar from '@comp/Avatar';
import Iconify from '@comp/Iconify';
import MenuPopover from '@comp/MenuPopover';
import {useSelector,State,useDispatch,PortalnesiaUser} from '@redux/index'
import Image from '@comp/Image'
import portalnesia from '@utils/api'
import SessionStorage from '@utils/session-storage'
import Backdrop from '@comp/Backdrop'
import {useTranslation,TFunction} from 'next-i18next'
import { useRouter } from 'next/router';

const MENU_OPTIONS = (t: TFunction,user: PortalnesiaUser)=>([
  {
    label: t("profile"),
    icon: 'eva:person-fill',
    target:'_blank',
    linkTo: `${process.env.NEXT_PUBLIC_PORTAL_URL}/user/${user.username}`
  },
  {
    label: t("setting"),
    icon: 'eva:settings-2-fill',
    target:'_blank',
    linkTo: `${process.env.NEXT_PUBLIC_PORTAL_URL}/setting`
  }
]);

export default function AccountPopover() {
  const {t} = useTranslation('menu');
  const router = useRouter();
  const user = useSelector<State['user']>(s=>s.user);
  const dispatch = useDispatch();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading,setLoading] = useState(false)

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const logout=useCallback(()=>{
    portalnesia.logout()
    dispatch({type:"CUSTOM",payload:{user:false}});
    window.location.reload();
  },[dispatch])

  const login = useCallback(()=>{
    const {pathname,query,asPath} = {pathname:router.pathname,query:router.query,asPath:router.asPath};
    SessionStorage.set('auth',{pathname,query,asPath})
    const url = portalnesia.getAuthUrl()
    window.location.href = url;
  },[router.asPath,router.pathname,router.query])

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
        <Avatar alt="Profiles">
          {user && user?.picture ? (
            <Image src={`${user?.picture}&watermark=no`} webp alt={user?.name} />
          ) : user ? user?.name : undefined}
        </Avatar>
        {/*<Avatar src={account.photoURL} alt="photoURL" />*/}
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {user ? user?.name : "Guest"}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user ? `@${user?.username}` : '@portalnesia'}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {user && MENU_OPTIONS(t,user).map((option) => (
          <Link key={option.label} href={option.linkTo} passHref>
            <MenuItem
              component='a'
              onClick={handleClose}
              sx={{ typography: 'body2', py: 1, px: 2.5 }}
              {...(option?.target ? {target:option.target} : {})}
            >
              <Iconify
                icon={option.icon}
                sx={{
                  mr: 2,
                  width: 24,
                  height: 24
                }}
              />

              {option.label}
            </MenuItem>
          </Link>
        ))}

        <Box sx={{ p: 2, pt: 1.5 }}>
          {user ? (
            <Button onClick={logout} fullWidth color="inherit" variant="outlined">
              {t("logout")}
            </Button>
          ) : (
            <Button onClick={login} fullWidth color="inherit" variant="outlined">
              {t("signin")}
            </Button>
          )}
          
        </Box>
        <Backdrop open={loading} />
      </MenuPopover>
    </>
  );
}
