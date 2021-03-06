import { useMemo,useCallback,useRef,useState } from 'react';
// material
import { alpha } from '@mui/material/styles';
import { Box, MenuItem, ListItemIcon, ListItemText, IconButton,Tooltip } from '@mui/material';
// components
import MenuPopover from '@comp/MenuPopover';
import Iconify from '../components/Iconify';
import {useTranslation,TFunction} from 'next-i18next';
import useDarkTheme from '@utils/useDarkTheme'
import {State} from '@redux/types'

const THEME = (t: TFunction)=>([
  {
    value: 'auto',
    label: t("theme.device"),
  },
  {
    value: 'light',
    label: t("theme.light")
  },
  {
    value: 'dark',
    label: t("theme.dark"),
  }
]);

export default function ThemePopover() {
  const {t} = useTranslation('common');
  const {theme,setTheme} = useDarkTheme();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const Theme = useMemo(()=>THEME(t),[t]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  },[]);

  const handleClose = useCallback((value?: State['theme']) => () => {
    if(value) {
      setTheme(value)
    }
    setOpen(false);
  },[setTheme]);

  return (
    <>
      <Tooltip title={t("theme.theme")}>
        <IconButton
          ref={anchorRef}
          onClick={handleOpen}
          sx={{
            padding: 0,
            width: 44,
            height: 44
          }}
        >
          <Iconify icon={'mdi:theme-light-dark'} height={20} width={28} />
        </IconButton>
      </Tooltip>
      
      <MenuPopover open={open} onClose={handleClose()} anchorEl={anchorRef.current}>
        <Box sx={{ py: 1 }}>
          {Theme.map((t)=>(
            <MenuItem
              key={t.value}
              selected={t.value === theme}
              onClick={handleClose(t.value as State['theme'])}
              sx={{ py: 1, px: 2.5 }}
            >
              <ListItemText primaryTypographyProps={{ variant: 'body2' }}>
                {t.label}
              </ListItemText>
            </MenuItem>
          ))}
        </Box>
      </MenuPopover>
    </>
  )
}