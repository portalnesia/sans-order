import { useRef, useState,useMemo,useCallback } from 'react';
// material
import { alpha } from '@mui/material/styles';
import { Box, MenuItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
// components
import MenuPopover from '@comp/MenuPopover';
import {useRouter} from 'next/router';
import Iconify from '../components/Iconify';
import cookie from 'js-cookie'
import {getDayJs} from '@utils/Main'
// ----------------------------------------------------------------------

const LANGS = [
  {
    value: 'en',
    label: 'English',
    icon: 'flag:gb-4x3'
  },
  {
    value: 'id',
    label: 'Indonesia',
    icon: 'flag:id-4x3'
  }
];

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const router = useRouter();
  const locale = router.locale;
  const route = router.route

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  },[]);

  const handleClose = useCallback((selected?: typeof LANGS[0]) => () => {
    if(selected) {
      cookie.set("NEXT_LOCALE",selected.value,{expires:getDayJs().add(1,'year').toDate()})
      router.replace(route,undefined,{locale:selected.value})
    }
    setOpen(false);
  },[route]);

  const selectedLanguage = useMemo(()=>{
    const loc = locale||'en';
    const selected = LANGS.find(l=>l.value === loc);
    return selected||LANGS[0];
  },[locale])

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        title={selectedLanguage.label}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity)
          })
        }}
      >
        <Iconify icon={selectedLanguage.icon} height={20} width={28} />
      </IconButton>

      <MenuPopover open={open} onClose={handleClose()} anchorEl={anchorRef.current}>
        <Box sx={{ py: 1 }}>
          {LANGS.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === selectedLanguage.value}
              onClick={handleClose(option)}
              sx={{ py: 1, px: 2.5 }}
            >
              <ListItemIcon>
              <Iconify icon={option.icon} height={20} width={28} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'body2' }}>
                {option.label}
              </ListItemText>
            </MenuItem>
          ))}
        </Box>
      </MenuPopover>
    </>
  );
}
