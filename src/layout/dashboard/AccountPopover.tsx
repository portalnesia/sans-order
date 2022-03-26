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
import {useTranslations} from 'next-intl'
import cookie from 'js-cookie'

const MENU_OPTIONS = (t: ReturnType<typeof useTranslations>,user: IUser)=>([
  {
    label: t("Menu.profile"),
    icon: 'eva:person-fill',
    target:'_blank',
    linkTo: `${process.env.DOMAIN}/user/${user.username}`
  },
  {
    label: t("Menu.setting"),
    icon: 'eva:settings-2-fill',
    target:'_blank',
    linkTo: `${process.env.DOMAIN}/setting`
  }
]);

export default function AccountPopover() {
  const t = useTranslations();
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
      SessionStorage.remove('sans_token');
      dispatch({type:"CUSTOM",payload:{user:false}});
      setLoading(false);
    }
  },[])

  if(!user) return null;
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
          {user?.picture ? (
            <Image src={`${user?.picture}&watermark=no`} webp alt={user?.name} />
          ) : user?.name}
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
            {user?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {`@${user?.username}`}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {MENU_OPTIONS(t,user).map((option) => (
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
          <Button onClick={logout} fullWidth color="inherit" variant="outlined">
            {t("Menu.logout")}
          </Button>
        </Box>
        <Backdrop open={loading} />
      </MenuPopover>
    </>
  );
}
