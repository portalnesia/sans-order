import { useState,useCallback,useMemo,useRef,useEffect,ChangeEvent } from 'react';
import {useRouter} from 'next/router'
//import PropTypes from 'prop-types';
//import { NavLink as RouterLink, matchPath, useLocation } from 'react-router-dom';
// material
import { Box, Stack, BoxProps, List, IconButton, ListItemText, ListItemIcon, ListItemButton, Typography,TextField, Divider } from '@mui/material';
import {Close} from '@mui/icons-material'
import Iconify from './Iconify';
import Image from './Image'
<<<<<<< HEAD
import {useTranslation} from 'next-i18next'
=======
import {useTranslations} from 'next-intl'
>>>>>>> main
import dynamic from 'next/dynamic'
import Button from './Button';
import useOutlet from '@utils/useOutlet';
import qrOptions from '@utils/defaultQr';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))

export interface MenuQrProps extends BoxProps {
  
};

export default function MenuQr({...other}: MenuQrProps) {
<<<<<<< HEAD
  const {t} = useTranslation('common');
=======
  const t = useTranslations();
>>>>>>> main
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const [imgUrl,setImgUrl] = useState<string|undefined>()
  const [table,setTable] = useState<string|undefined>();
  const [open,setOpen]=useState(false);
  const {outlet} = useOutlet(toko_id,outlet_id);
  let qr = useRef<any>();

  const handleGenerate = useCallback(async()=>{
    setImgUrl(undefined);
    const op = {...qrOptions,data:`${process.env.URL}/merchant/${toko_id}/${outlet_id}${table && table.length > 0 ? `?table_number=${table}` : ''}`}
    qr.current?.update(op);
    const image = await qr.current?.getRawData('png');
    if(typeof image !== 'undefined' && image !== null) {
      const url = (window.webkitURL || window.URL).createObjectURL(image);
      setImgUrl(url);
    }
  },[toko_id,outlet_id,table])

  useEffect(()=>{
    async function getQr() {
      const QrCode = (await import('qr-code-styling')).default
      qr.current = new QrCode(qrOptions);
    }
    getQr();
  },[])

  useEffect(()=>{
    if(!open) {
      setTable(undefined);
      setImgUrl(undefined)
    }
  },[open])

  return (
    <>
      <Box {...other}>
        <List disablePadding>
          <ListItemButton sx={{pl:5,pr:2.5,height:48}} onClick={()=>setOpen(true)}>
            <ListItemIcon>
              <Iconify icon='fluent:qr-code-20-regular' width={22} height={22} />
            </ListItemIcon>
            <ListItemText disableTypography primary={`Menu Qr Code`} />
          </ListItemButton>
        </List>
      </Box>

      <Dialog open={open} handleClose={()=>setOpen(false)}>
        <DialogTitle>
          <Stack direction='row' justifyContent={'space-between'} alignItems='center' spacing={2}>
            <Typography variant='h6'>Menu Qr Code</Typography>
            <IconButton onClick={()=>setOpen(false)}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{px:0}}>
          <Box px={3} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Stack direction='row' justifyContent={'space-between'} alignItems='center' spacing={2}>
              <TextField
                value={table}
                onChange={(e)=>setTable(e.target.value)}
<<<<<<< HEAD
                label={t("table_number")}
=======
                label={t("Subcribe.feature.table_number")}
>>>>>>> main
                placeholder="A1"
              />
              <Button onClick={handleGenerate}>Generate</Button>
            </Stack>
          </Box>
          
          {imgUrl && (
            <>
              <Divider sx={{my:3}} />
              <Box px={3}>
                <Image dataSrc={imgUrl} src={imgUrl} fancybox style={{maxWidth:'80%',height:'auto',marginLeft:'auto',marginRight:'auto'}} />
              </Box>
              <Box px={3} mt={2} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                <Button href={imgUrl} download={`Menu ${outlet?.name}${table && table.length > 0 ? ` (table ${table})` : ''}.png`}>Download</Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}