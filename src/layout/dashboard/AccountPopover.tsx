import { useRef, useState,useCallback } from 'react';
import Link from 'next/link';
// material
import { alpha } from '@mui/material/styles';
import { Button, Box, Divider, MenuItem, Typography, IconButton } from '@mui/material';
// components
import Avatar from '@comp/Avatar';
import Iconify from '@comp/Iconify';
import MenuPopover from '@comp/MenuPopover';
import {useSelector,State,IUser,useDispatch} from '@redux/index'
import Image from '@comp/Image'
import portalnesia from '@utils/portalnesia'
import SessionStorage from '@utils/session-storage'
import Backdrop from '@comp/Backdrop'
import {useTranslation,TFunction} from 'next-i18next'
import cookie from 'js-cookie'
import { useRouter } from 'next/router';
import LocalStorage from '@utils/local-storage';

const MENU_OPTIONS = (t: TFunction,user: IUser)=>([
  {
    label: t("profile"),
    icon: 'eva:person-fill',
    target:'_blank',
    linkTo: `${process.env.DOMAIN}/user/${user.username}`
  },
  {
    label: t("setting"),
    icon: 'eva:settings-2-fill',
    target:'_blank',
    linkTo: `${process.env.DOMAIN}/setting`
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

  const logout=useCallback(async()=>{
    setLoading(true)
    try {
      await portalnesia.oauth.revokeToken();
      cookie.remove("_so_token_");
    } finally {
      LocalStorage.remove('sans_token');
      dispatch({type:"CUSTOM",payload:{user:false}});
      setLoading(false);
    }
  },[])

<<<<<<< HEAD
  const login = useCallback(()=>{
    const code = portalnesia.oauth.generatePKCE();
    LocalStorage.set('pkce',code);
    const {pathname,query,asPath} = router;
    SessionStorage.set('auth',{pathname,query,asPath})
    const url = portalnesia.oauth.getAuthorizationUrl({code_challenge:code.code_challenge});
    
    window.location.href = url;
  },[router.asPath,router.pathname,router.query])

=======
>>>>>>> main
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
<<<<<<< HEAD
              {t("logout")}
            </Button>
          ) : (
            <Button onClick={login} fullWidth color="inherit" variant="outlined">
              {t("signin")}
=======
              {t("Menu.logout")}
            </Button>
          ) : (
            <Button fullWidth color="inherit" variant="outlined">
              {t("Login.sign")}
>>>>>>> main
            </Button>
          )}
          
        </Box>
        <Backdrop open={loading} />
      </MenuPopover>
    </>
  );
}
