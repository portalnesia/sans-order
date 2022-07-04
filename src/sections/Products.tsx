import Link from 'next/link'
import {Close,Add,Remove} from '@mui/icons-material'
import { Box, Card, Typography, Stack, CardMedia, CardContent, TextareaAutosize, IconButton,Badge, CardActionArea, Divider,Portal, Grid, Chip, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from '@comp/Image'
import Label from '@comp/Label'
import { numberFormat } from '@portalnesia/utils';
import { daysArray, IMenu } from '@type/index';
import { getDayJs, isBetweenHour, photoUrl } from '@utils/Main';
import Iconify from '@comp/Iconify';
import Button from '@comp/Button';
import {Markdown} from '@comp/Parser'
import {Context} from '@redux/cart'
import { useRouter } from 'next/router';
import { useCallback, useMemo,useContext,MouseEvent, useState, useEffect } from 'react';
import useOutlet from '@utils/useOutlet';
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next';
import {getAnalytics,logEvent} from '@utils/firebase'

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@comp/DialogActions'))

const ProductImgStyle = styled(Image)({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

interface ProductsProps {
  items: IMenu['data'][number],
  maxWidth?: boolean,
  enabled?: boolean
}

export default function Products({ items,maxWidth,enabled }: ProductsProps) {
  const {t:tCom} = useTranslation('common');
  const {t} = useTranslation('catalogue');
  const { name, image, price, disscount:priceSale,description } = items;
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const context = useContext(Context);
  const {cart,manualQty} = context;
  const {outlet} = useOutlet(toko_id,outlet_id);
  const [qty,setQty] = useState(0);
  const [notes,setNotes] = useState<string|undefined>(undefined);
  const [open,setOpen] = useState(false);

  const handleUpdateCart = useCallback((e: MouseEvent<HTMLButtonElement>)=>{
    if(e.stopPropagation) e.stopPropagation();
    const item = {
      id:items.id,
      name: items.name,
      price: items.price,
      disscount: items.disscount,
      metadata: items.metadata
    }
    //if(type === 'add') addQty({...item,disscount:0});
    //else if(type === 'remove') removeQty({...item,disscount:0})
    manualQty({...item,disscount:0},qty,notes);
    setOpen(false);
  },[items,manualQty,qty,notes])

  const cartQty = useMemo(()=>{
    const find = cart.find(c=>c.id === items.id);
    return (find ? find.qty : 0);
  },[items,cart])

  useEffect(()=>{
    const find = cart.find(c=>c.id === items.id);
    const qty = (find ? find.qty : 0);
    const notes = (find ? find.notes : undefined);
    setNotes(notes);
    setQty(qty)
  },[items,cart])

  const clickProduct = useCallback(()=>{
    const analytics = getAnalytics();
    logEvent(analytics,'view_item',{
      currency:"IDR",
      value: items.price-(items.disscount||0),
      items:[
        {
          item_id: `${items.id}`,
          item_name: items.name,
          discount: items.disscount||0,
          item_category: items.category||undefined,
          price: items.price
        }
      ]
    })
    setOpen(true)
  },[items])

  return (
    <Card {...(maxWidth ? {sx:{width:{xs:200,md:250,lg:300}}} : {})}>
      <CardActionArea onClick={clickProduct}>
        <CardMedia sx={{position:'relative'}}>
          <ProductImgStyle alt={name} src={`${photoUrl(image)}&watermark=no&export=banner&size=300&no_twibbon=true`} sx={{width:'100%',height:'auto'}} />
        </CardMedia>
        <CardContent sx={{pb:{xs:2,lg:3},px:{xs:2,lg:3,pt:{xs:2,lg:3}}}}>
          <Stack spacing={2}>
            <Typography noWrap>
              {name}
            </Typography>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">
                {((priceSale||0) > 0) && (
                  <>
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{
                        color: 'text.disabled',
                        textDecoration: 'line-through'
                      }}
                    >
                      {`IDR ${numberFormat(`${priceSale}`)}`}
                    </Typography>
                    &nbsp;
                  </>
                )}
                {`IDR ${numberFormat(`${price}`)}`}
              </Typography>
              {cartQty > 0 && (
                <Box sx={{px:{xs:2,lg:3}}}>
                  <Badge badgeContent={cartQty} color="secondary" max={10} />
                </Box>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
      {/*enabled && (
        <>
          <Divider />
          <CardActions sx={{justifyContent:'space-between',pt:1}}>
            <Box sx={{px:{xs:2,lg:3}}}>
              <Badge badgeContent={qty} color="secondary" max={10} />
            </Box>
            <Box flexGrow={1} />
            <Box display='flex' justifyContent={'flex-end'} alignItems='center'>
              <IconButton disabled={qty<=0} onClick={handleUpdateCart('remove')}>
                <Remove />
              </IconButton>
              <IconButton onClick={handleUpdateCart('add')}>
                <Add />
              </IconButton>
            </Box>
          </CardActions>
        </>
        
      )*/}
      <Portal>
        <Dialog open={open} onClose={()=>setOpen(false)}>
          <DialogTitle>{name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                {description ? <Markdown source={description} /> : <Typography>{tCom('no_what',{what:tCom('description').toLowerCase()})}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Typography>{`IDR ${numberFormat(`${price}`)}`}</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t("notes")}
                  value={notes||""}
                  onChange={(e)=>e.target.value.length <= 100 && setNotes(e.target.value)}
                  maxRows={2}
                  placeholder={t('example_notes')}
                  multiline
                  error={!!(notes && notes?.length >= 100)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Box width='100%' display='flex' flexDirection={'row'} justifyContent='space-between'>
              <Stack direction='row' spacing={2}>
                <IconButton disabled={qty<=0||!enabled} onClick={()=>setQty(qty>0 ? qty-1 : 0)}>
                  <Remove />
                </IconButton>
                <IconButton disabled={!enabled} onClick={()=>setQty(qty+1)}>
                  <Add />
                </IconButton>
                {qty > 0 && (
                  <Box>
                    <Chip label={`${qty}`} color='secondary' />
                  </Box>
                )}
              </Stack>
              <Button onClick={handleUpdateCart}>{tCom('update_ctx',{what:t('cart')})}</Button>
            </Box>
          </DialogActions>
        </Dialog>
      </Portal>
    </Card>
  )
}