import {Add,Remove} from '@mui/icons-material'
import { Box, Card, Typography, Stack, CardMedia, CardContent, IconButton,Badge, CardActionArea, Portal, Grid, Chip, TextField,Hidden, ListItemButton, ListItemText, ListItemSecondaryAction, ListItemAvatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from '@comp/Image'
import { numberFormat } from '@portalnesia/utils';
import { ProductMenu } from '@type/index';
import { photoUrl } from '@utils/Main';
import Button from '@comp/Button';
import {Markdown} from '@comp/Parser'
import {Context, Items} from '@redux/cart'
import { useCallback, useMemo,useContext,MouseEvent, useState, useEffect } from 'react';
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
  items: ProductMenu['data'][number],
  maxWidth?: boolean,
  enabled?: boolean
}

export default function Products({ items,maxWidth,enabled }: ProductsProps) {
  const {t:tCom} = useTranslation('common');
  const {t} = useTranslation('catalogue');
  const { id,name, image, price, promo,description,metadata, category } = items;
  
  const context = useContext(Context);
  const {cart,manualQty} = context;
  const [qty,setQty] = useState(0);
  const [notes,setNotes] = useState<string|undefined>(undefined);
  const [open,setOpen] = useState(false);

  const discount = useMemo(()=>{
    if(promo) {
      if(promo.type === 'fixed') return promo.amount;
      if(promo.type === 'percentage') return Number.parseFloat((price * promo.amount).toFixed(2));
    }
    return 0;
  },[promo,price])

  const finalPrice = useMemo(()=>price - discount,[price,discount]);

  const handleUpdateCart = useCallback((e: MouseEvent<HTMLButtonElement>)=>{
    if(e.stopPropagation) e.stopPropagation();
    const item: Items = {
      item: items,
      price:items.price,
      discount
    }
    //if(type === 'add') addQty({...item,discount:0});
    //else if(type === 'remove') removeQty({...item,discount:0})
    manualQty({...item},qty,notes);
    setOpen(false);
  },[items,discount,manualQty,qty,notes])

  const cartQty = useMemo(()=>{
    const find = cart.find(c=>c.item.id === items.id);
    return (find ? find.qty : 0);
  },[items,cart])

  useEffect(()=>{
    const find = cart.find(c=>c.item.id === items.id);
    const qty = (find ? find.qty : 0);
    const notes = (find ? find.notes : undefined);
    setNotes(notes);
    setQty(qty)
  },[items,cart])

  const clickProduct = useCallback(()=>{
    const analytics = getAnalytics();
    logEvent(analytics,'view_item',{
      currency:"IDR",
      value: finalPrice,
      items:[{
        item_id: `${id}`,
        item_name: name,
        discount: discount,
        item_category: category,
        price: finalPrice
      }]
    })
    setOpen(true)
  },[name, finalPrice, id,, discount,category])

  return (
    <>
      <Hidden smDown key={`${id}-smdown`}>
        <Card {...(maxWidth ? {sx:{width:{xs:200,md:250,lg:300}}} : {})}>
          <CardActionArea onClick={clickProduct}>
            <CardMedia sx={{position:'relative'}}>
              <ProductImgStyle alt={name} src={`${photoUrl(image?.url||null)}`} sx={{width:'100%',height:'auto'}} />
            </CardMedia>
            <CardContent sx={{pb:{xs:2,lg:3},px:{xs:2,lg:3,pt:{xs:2,lg:3}}}}>
              <Stack spacing={2}>
                <Typography noWrap>
                  {name}
                </Typography>

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1">
                    {((discount||0) > 0) && (
                      <>
                        <Typography
                          component="span"
                          variant="body1"
                          sx={{
                            color: 'text.disabled',
                            textDecoration: 'line-through',
                            fontSize:13
                          }}
                        >
                          {numberFormat(`${price}`)}
                        </Typography>
                        &nbsp;
                      </>
                    )}
                    {`Rp${numberFormat(`${finalPrice}`)}`}
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
        </Card>
      </Hidden>
      <Hidden smUp key={`${id}-smup`}>
        <ListItemButton onClick={clickProduct} sx={{margin:'0 -16px'}}>
          <ListItemAvatar>
            <ProductImgStyle alt={name} src={`${photoUrl(image?.url||null)}`} sx={{width:80,height:'auto'}} />
          </ListItemAvatar>
          <ListItemText
            disableTypography
            primary={
              <Typography noWrap variant="subtitle1" sx={{fontSize:'1.1rem'}}>
                {name}
              </Typography>
            }
            secondary={
              <Typography>
                {((discount||0) > 0) && (
                  <>
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{
                        color: 'text.disabled',
                        textDecoration: 'line-through',
                        fontSize:13
                      }}
                    >
                      {numberFormat(`${price}`)}
                    </Typography>
                    &nbsp;
                  </>
                )}
                {`Rp${numberFormat(`${finalPrice}`)}`}
              </Typography>
            }
          />
          {cartQty > 0 && (
            <ListItemSecondaryAction sx={{justifyContent:'center',alignItems:'center',textAlign:'center'}}>
              <Typography variant="h4" sx={{fontWeight:'normal'}}>{cartQty}</Typography>
              <Typography sx={{color: 'text.disabled',fontSize:13}}>pcs</Typography>
            </ListItemSecondaryAction>
          )}
        </ListItemButton>
      </Hidden>
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
      <Portal key={`${id}`}>
        <Dialog open={open} onClose={()=>setOpen(false)}>
          <DialogTitle>{name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box mt={2} display='flex' justifyContent={'center'}><ProductImgStyle alt={name} src={`${photoUrl(image?.url||null)}`} fancybox sx={{maxWidth:200,height:'auto'}} /></Box>
              </Grid>
              
              <Grid item xs={12}>
                {description ? <Markdown source={description} /> : <Typography>{tCom('no_what',{what:tCom('description').toLowerCase()})}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Typography>{`Rp${numberFormat(`${price}`)}`}</Typography>
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
    </>
  )
}