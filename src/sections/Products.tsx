import Link from 'next/link'
import {Close,Add,Remove} from '@mui/icons-material'
import { Box, Card, Typography, Stack, CardMedia, CardContent, CardActions, IconButton,Badge, CardActionArea, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from '@comp/Image'
import Label from '@comp/Label'
import { numberFormat } from '@portalnesia/utils';
import { daysArray, IMenu } from '@type/index';
import { getDayJs, isBetweenHour, isOutletOpen, photoUrl } from '@utils/Main';
import Iconify from '@comp/Iconify';
import Button from '@comp/Button';
import {Context} from '@redux/cart'
import { useRouter } from 'next/router';
import { useCallback, useMemo,useContext,MouseEvent, useState, useEffect } from 'react';
import useOutlet from '@utils/useOutlet';


const ProductImgStyle = styled(Image)({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

interface ProductsProps {
  items: IMenu['data'][number],
  maxWidth?: boolean
}

export default function Products({ items,maxWidth }: ProductsProps) {
  const { name, image, price, disscount:priceSale } = items;
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const context = useContext(Context);
  const {cart,addQty,removeQty} = context;
  const {outlet} = useOutlet(toko_id,outlet_id);
  const [open,setOpen] = useState(false);

  const handleUpdateCart = useCallback((type:'add'|'remove')=>(e: MouseEvent<HTMLButtonElement>)=>{
    if(e.stopPropagation) e.stopPropagation();
    const item = {
      id:items.id,
      name: items.name,
      price: items.price,
      disscount: items.disscount,
      metadata: items.metadata
    }
    if(type === 'add') addQty({...item,disscount:0});
    else if(type === 'remove') removeQty({...item,disscount:0})
  },[items,addQty,removeQty])

  const qty = useMemo(()=>{
    const find = cart.find(c=>c.id === items.id);
    return (find ? find.qty : 0)
  },[items,cart])

  const clickProduct = useCallback(()=>{
    console.log(items.name)
  },[items])

  const enabled = useMemo(()=>{
    return isOutletOpen(outlet).enabled;
  },[outlet])

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
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
      {enabled && (
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
        
      )}
    </Card>
  )
}