import React from 'react'
import {Fab as FabOri,Zoom,styled, SxProps,Theme} from '@mui/material'
import Iconify from './Iconify'
import config from '../../web.config.json'
import { getAnalytics, logEvent } from '@utils/firebase'

const Fab = styled(FabOri)(({theme})=>({
  position: 'fixed',
  right:theme.spacing(3),
  bottom:theme.spacing(3),
  [theme.breakpoints.up('md')]:{
    right:theme.spacing(4),
    bottom:theme.spacing(4),
  }
}))

export interface WhatsappWidgetProps {
  sx?: SxProps<Theme>
  enabled?: boolean,
  color?: "error" | "inherit" | "default" | "primary" | "secondary" | "success" | "info" | "warning"
}

export default function WhatsappWidget({sx,enabled=true,color='primary'}: WhatsappWidgetProps) {
  const onClick = React.useCallback(()=>{
    const analytics = getAnalytics();
    logEvent(analytics,'click',{
      content_type:'button',
      item_id:'whatsapp_contact_button'
    })
    const wa = config.contact.whatsapp;
    window.open(`https://wa.me/${wa}`);
  },[])

  if(!enabled) return null;
  return (
    <Fab color={color} sx={sx} onClick={onClick}>
      <Iconify icon='akar-icons:whatsapp-fill' sx={{width:24,height:24}} />
    </Fab>
  )
}