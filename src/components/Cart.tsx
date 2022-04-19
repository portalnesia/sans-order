import React from 'react'
import {Fab,Portal,styled,Badge,Fade,Tooltip,Box,Table,TableHead,TableRow,TableBody,TableCell, TableFooter,IconButton, Typography, Stack,List,ListItem,ListItemText, ListItemSecondaryAction, Divider} from '@mui/material'
import {Close,Add,Remove} from '@mui/icons-material'
import {Context} from '@redux/cart';
import Iconify from '@comp/Iconify'
import dynamic from 'next/dynamic'
import { useTranslations } from 'use-intl';
import { numberFormat } from '@portalnesia/utils';
import Button from './Button';
import Payment from '@comp/Payment'

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

const FabStyled = styled(Fab)(({theme})=>({
  position:'fixed',
  right:theme.spacing(3),
  bottom:theme.spacing(3),
  [theme.breakpoints.up('md')]:{
    right:theme.spacing(5),
    bottom:theme.spacing(5),
  }
}))

function CartFab({onClick}:{onClick(): void}) {
  const t = useTranslations();
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
        <Tooltip title={t("Payment.cart")}>
          <FabStyled color='primary' onClick={onClick}>
            <Badge badgeContent={length} color="error" max={10}>
              <Iconify icon="eva:shopping-cart-fill" width={24} height={24} />
            </Badge>
          </FabStyled>
        </Tooltip>
      </Fade>
    </Portal>
  )
}

export default function Cart({table_number}: {table_number?:string}) {
  const t = useTranslations();
  const context = React.useContext(Context);
  const {cart,addQty,removeQty} = context;
  const [open,setOpen] = React.useState(false);
  const [pay,setPay] = React.useState(false);

  const {total,subtotal,disscount} = React.useMemo(()=>{
    const {price,disscount} = cart.reduce((p,n)=>{
      const price = n.price * n.qty;
      const disscount = n.disscount * n.qty;
      p.price = p.price + price;
      p.disscount = p.disscount + disscount;
      return p;
    },{price:0,disscount:0})

    const total = price - disscount
    return {total,subtotal:price,disscount};
  },[cart])

  const handlePayBtn = React.useCallback(()=>{
    setOpen(false);
    setPay(true)
  },[])

  return (
    <>
      <Dialog open={open} handleClose={()=>setOpen(false)}>
        <DialogTitle>
          <Stack direction='row' justifyContent={'space-between'} alignItems='center' spacing={2}>
            <Typography variant='h6'>{t("Payment.cart")}</Typography>
            <IconButton onClick={()=>setOpen(false)}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers {...(cart.length > 0 ? {sx:{px:0}} : {})}>
          {cart.length > 0 ? (
            <List component={'div'}>
              {cart.map((c,i)=>(
                <ListItem>
                  <ListItemText primary={c.name} secondary={`IDR ${numberFormat(`${(c.price*c.qty)-(c.disscount*c.qty)}`)}`} />
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
                  <Typography variant='body2'>{`IDR ${numberFormat(`${subtotal}`)}`}</Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary={t("Product.disscount")} />
                <ListItemSecondaryAction>
                  <Typography variant='body2'>{`IDR ${numberFormat(`${disscount}`)}`}</Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="Total" />
                <ListItemSecondaryAction>
                  <Typography variant='body2'>{`IDR ${numberFormat(`${total}`)}`}</Typography>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          ) : (
            <Typography>{t("General.no",{what:t("Menu.products")})}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{p:2}}>
          <Button disabled={cart.length === 0} onClick={handlePayBtn}>{t("Payment.pay")}</Button>
        </DialogActions>
      </Dialog>
      <CartFab onClick={()=>setOpen(true)} />
      <Payment open={pay} handleClose={()=>setPay(false)} table_number={table_number} />
    </>
  )
}