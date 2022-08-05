import React from 'react'
import {Fab,Portal,styled,Badge,Fade,Tooltip,Box,Table,TableHead,TableRow,TableBody,TableCell, TableFooter,IconButton, Typography, Stack,List,ListItem,ListItemText, ListItemSecondaryAction, Divider} from '@mui/material'
import {Close,Add,Remove} from '@mui/icons-material'
import {Context} from '@redux/cart';
import Iconify from '@comp/Iconify'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next';
import { numberFormat } from '@portalnesia/utils';
import Button from './Button';
import Payment from '@comp/Payment'
import {logEvent,getAnalytics} from '@utils/firebase'

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

const FabStyled = styled(Fab)(({theme})=>({
  position:'fixed',
  right:theme.spacing(3),
  bottom:theme.spacing(3),
  [theme.breakpoints.up('md')]:{
    right:theme.spacing(4),
    bottom:theme.spacing(4),
  }
}))

function CartFab({onClick,enabled}:{onClick(): void,enabled?:boolean}) {
  const {t} = useTranslation('catalogue');
  const context = React.useContext(Context);
  const {cart} = context;

  const length = React.useMemo(()=>{
    const {qty} = cart.reduce((p,n)=>{
      p.qty = p.qty + n.qty;
      return p;
    },{qty:0})
    return qty;
  },[cart])
  
  return (
    <Portal>
      <Fade in={length > 0} unmountOnExit>
        <Tooltip title={t("cart")}>
          <FabStyled color='primary' onClick={onClick} disabled={!!enabled}>
            <Badge badgeContent={length} color="error" max={10}>
              <Iconify icon="eva:shopping-cart-fill" width={24} height={24} />
            </Badge>
          </FabStyled>
        </Tooltip>
      </Fade>
    </Portal>
  )
}

export default function Cart({table_number,enabled}: {table_number?:string,enabled?:boolean}) {
  const {t} = useTranslation('catalogue');
  const {t: tCom} = useTranslation('common');
  const {t: tMenu} = useTranslation('menu');
  const context = React.useContext(Context);
  const {cart,addQty,removeQty} = context;
  const [open,setOpen] = React.useState(false);
  const [pay,setPay] = React.useState(false);

  const {total,subtotal,discount} = React.useMemo(()=>{
    const {price,discount} = cart.reduce((p,n)=>{
      const price = n.price * n.qty;
      const discount = n.discount * n.qty;
      p.price = p.price + price;
      p.discount = p.discount + discount;
      return p;
    },{price:0,discount:0})

    const total = price - discount
    return {total,subtotal:price,discount};
  },[cart])

  const handlePayBtn = React.useCallback(()=>{
    const analytics = getAnalytics();
    logEvent(analytics,'begin_checkout',{
      currency:"IDR",
      value: total,
      items:cart.map(i=>({
        item_id: `${i.item.id}`,
        item_name: i.item.name,
        discount: i.discount,
        price: i.price,
        quantity: i.qty
      }))
    })
    setOpen(false);
    setPay(true)
  },[cart,total])

  React.useEffect(()=>{
    if(open) {
      const analytics = getAnalytics();
      logEvent(analytics,'view_cart',{
        currency:"IDR",
        value: total,
        items:cart.map(i=>({
          item_id: `${i.item.id}`,
          item_name: i.item.name,
          discount: i.discount,
          price: i.price,
          quantity: i.qty
        }))
      })
    }
  },[cart,open,total])

  return (
    <>
      <Dialog open={open} handleClose={()=>setOpen(false)}>
        <DialogTitle>
          <Stack direction='row' justifyContent={'space-between'} alignItems='center' spacing={2}>
            <Typography variant='h6'>{t("cart")}</Typography>
            <IconButton onClick={()=>setOpen(false)}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers {...(cart.length > 0 ? {sx:{px:0}} : {})}>
          {cart.length > 0 ? (
            <List component={'div'}>
              {cart.map((c,i)=>(
                <ListItem key={c.item.id}>
                  <ListItemText primary={c.item.name} secondary={
                    <>
                      <Typography>{`Rp${numberFormat(`${(c.price*c.qty)-(c.discount*c.qty)}`)}`}</Typography>
                      {c.discount > 0 && <Typography variant='caption'>{`disc. Rp${numberFormat(`${(c.discount*c.qty)}`)}`}</Typography>}
                      {c?.notes && <Typography variant='caption'>{`${t('notes')}: ${c?.notes}`}</Typography>}
                    </>
                  } />
                  <ListItemSecondaryAction>
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <IconButton size='small' onClick={()=>removeQty(c)}><Remove /></IconButton>
                      <Typography variant='body2'>{c.qty}</Typography>
                      <IconButton size='small' onClick={()=>addQty(c)}><Add /></IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              <Divider sx={{my:2}} />
              <ListItem>
                <ListItemText primary="Subtotal" />
                <ListItemSecondaryAction>
                  <Typography variant='body2'>{`Rp${numberFormat(`${subtotal}`)}`}</Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary={t("discount")} />
                <ListItemSecondaryAction>
                  <Typography variant='body2'>{`Rp${numberFormat(`${discount}`)}`}</Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Total" />
                <ListItemSecondaryAction>
                  <Typography variant='body2'>{`Rp${numberFormat(`${total}`)}`}</Typography>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          ) : (
            <Typography>{tCom("no_what",{what:tMenu("products")})}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{p:2}}>
          <Button disabled={cart.length === 0} onClick={handlePayBtn}>{t("pay")}</Button>
        </DialogActions>
      </Dialog>
      <CartFab enabled={!enabled} onClick={()=>setOpen(true)} />
      <Payment open={pay} handleClose={()=>setPay(false)} table_number={table_number} />
    </>
  )
}