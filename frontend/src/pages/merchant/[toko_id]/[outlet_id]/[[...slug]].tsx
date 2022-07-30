import React, { useMemo } from 'react'
import { Box, Grid, Container, Typography, Stack, Table, TableBody, TableRow, TableCell } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import Image from '@comp/Image'
import {useTranslation} from 'next-i18next';
import useSWR from '@utils/swr'
import {Circular} from '@comp/Loading'
import Iconify from '@comp/Iconify'
import wrapper from '@redux/store'
import { Outlet, IPages, ProductMenu,IDays } from '@type/index';
import { useRouter } from 'next/router';
import { getDayJs, isOutletOpen, photoUrl, sortBusinessHour } from '@utils/Main';
import Pagination,{usePagination} from '@comp/Pagination'
import { Markdown } from '@comp/Parser';
import Scrollbar from '@comp/Scrollbar'
import { numberFormat, ucwords } from '@portalnesia/utils';
import Products from '@sections/Products';
import Button from '@comp/Button';
import CartContext from '@redux/cart'
import Cart from '@comp/Cart';
import SessionStorage from '@utils/session-storage';
import { ISocket, Socket } from '@utils/Socket';

export const getServerSideProps = wrapper(async({checkOutlet,params,redirect})=>{
  const slug = params?.slug;
  if(typeof slug?.[1] !== 'undefined') {
    return redirect();
  }
  return await checkOutlet({onlyMyToko:false},['catalogue']);
});

interface CarouselProps {
  data: ProductMenu,
  enabled: boolean
}

function Carousel({data,enabled}: CarouselProps) {
  const {t} = useTranslation('catalogue');
  const router = useRouter();
  const {toko_id,outlet_id,slug} = router.query;
  return (
    <>
      <Stack mb={4} direction='row' justifyContent={'space-between'} alignItems='center' spacing={2} sx={{pb:1,mb:4,borderBottom:(theme)=>`1px solid ${theme.palette.divider}`}}>
        <Typography variant='h3' component='h3'>{data.category}</Typography>
        {!slug && data.data.length >= 5 && (
          <Button size='small' onClick={()=>router.push(`/merchant/[toko_id]/[outlet_id]/[[...slug]]`,`/merchant/${toko_id}/${outlet_id}/${encodeURIComponent(data.category)}`,{shallow:true})}>{t("view_more")}</Button>
        )}
      </Stack>
      <Box>
        <Scrollbar>
          <Box display='flex' flexDirection="row" alignItems="center">
            {data.data.map((d,i)=>(
              <Box px={1}><Products enabled={enabled} maxWidth items={d} /></Box>
            ))}
          </Box>
        </Scrollbar>
      </Box>
    </>
  )
}

interface GridDataProps {
  data: ProductMenu
  page: number,
  setPage(_e:any,p:number): void
  count: number,
  onBack(): void,
  enabled: boolean
}
function GridData({data,page,setPage,count,onBack,enabled}: GridDataProps) {
  const {t} = useTranslation('common');
  const router = useRouter();
  const {slug} = router.query;

  return (
    <>
      <Stack mb={4} direction='row' justifyContent={'space-between'} alignItems='center' spacing={2} sx={{pb:1,mb:4,borderBottom:(theme)=>`1px solid ${theme.palette.divider}`}}>
        <Typography variant='h3' component='h3'>{ucwords(slug?.[0] as string)}</Typography>
        {typeof slug?.[0] === 'string' && (
          <Button size='small' onClick={onBack}>{t("back")}</Button>
        )}
      </Stack>
      <Box>
        <Grid container spacing={4}>
          {data.data.map((d,i)=>(
            <Grid item xs={12} sm={6} md={4} lg={3} key={`product-${d.id}`}>
              <Products enabled={enabled} items={d} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Pagination page={page} onChange={setPage} count={count} />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

function MerchantOutlet({meta}: IPages<Outlet>) {
	const router = useRouter();
  const {t} = useTranslation('catalogue')
	const {toko_id,outlet_id,slug,table_number} = router.query;
  const locale = router.locale;
  const [page,setPage] = usePagination(true);
  const {data,error} = useSWR<ProductMenu,true>(typeof slug?.[0] === 'undefined' ? `/products/${outlet_id}/menu?page=1&pageSize=5` : `/products/${outlet_id}/menu/${encodeURIComponent(slug?.[0])}?page=${page}&pageSize=25`)
  const [table,setTable] = React.useState<string|undefined>();
  const [socket,setSocket]=React.useState<ISocket>();
  const [openSocket,setOpenSocket] = React.useState(false);
  let sudah = React.useRef(false);

  const onBack = React.useCallback(()=>{
    if(!sudah.current) {
      router.push(`/merchant/[toko_id]/[outlet_id]/[[...slug]]`,`/merchant/${toko_id}/${outlet_id}`,{shallow:true})
    } else {
      router.back();
    }
  },[toko_id,outlet_id])

  const isEnabled = useMemo(()=>{
    return isOutletOpen(meta?.data,openSocket);
  },[meta,openSocket])

  const status = useMemo(()=>{
    if(!isEnabled.opened) return {color:'error.main',text:t('close')}
    if(isEnabled.busy) return {color:'warning.main',text:t('busy')};
    if(!isEnabled.enabled) return {color:'warning.main',text:t('busy')};
    return {color:'primary.main',text:t('open')}
  },[isEnabled,t])

  React.useEffect(()=>{
    const str = SessionStorage.get(`outlet_${toko_id}/${outlet_id}`);
    if(typeof table_number === 'string' && router.isReady && typeof table === 'undefined') {
      setTable(table_number);
      SessionStorage.set(`outlet_${toko_id}/${outlet_id}`,{table_number})
      router.replace({pathname:router.pathname,query:router.query},`/merchant/${toko_id}/${outlet_id}${slug ? `/slug`:''}`,{shallow:true})
    }
    else if(str && str?.table_number && router.isReady && typeof table === 'undefined') {
      setTable(str?.table_number);
      router.replace({pathname:router.pathname,query:router.query},`/merchant/${toko_id}/${outlet_id}${slug ? `/slug`:''}`,{shallow:true})
    }
  },[table_number,router,table])

  React.useEffect(()=>{
    if(typeof slug?.[0] === 'undefined') sudah.current = true;
    else sudah.current = false;
  },[slug])

  React.useEffect(()=>{
    function handleOpened(outlet?: Outlet|any) {
      if(outlet === true) setOpenSocket(false);
      if(outlet?.id === Number(outlet_id)) setOpenSocket(true)
    }
    function handleClosed(outlet?: Outlet|any) {
      if(outlet === true) setOpenSocket(false);
      if(outlet?.id === Number(outlet_id)) setOpenSocket(false);
    }
    function handleRegistered({opened}: {opened?: any}) {
      setOpenSocket(!!opened)
    }
    
    socket?.on('outlet registered',handleRegistered)
    socket?.on('toko open',handleOpened);
    socket?.on('toko closed',handleClosed);
    socket?.on('disconnect',()=>handleClosed(true));
    return ()=>{
      socket?.off('outlet registered',handleRegistered)
      socket?.off('toko open',handleOpened);
      socket?.off('toko closed',handleClosed);
      socket?.off('disconnect',()=>handleClosed(true));
    }
  },[socket,outlet_id])

  return (
    <Header title={meta?.data?.name} desc={meta?.data?.description} image={meta?.data?.toko?.logo?.url}>
      <CartContext>
        <Socket dashboard={false} view={'outlet menu'} onRef={setSocket} />
        <Dashboard withDashboard={false} withNavbar={false} logoProps={{href:!meta?.data ? false : `merchant/${meta?.data?.toko?.slug}/${meta?.data.id}`}}
        whatsappWidget={{enabled:false}}>
          <Container maxWidth='lg' sx={{mt:2}}>
            <Box textAlign='center' mb={4}>
              {meta?.data?.toko?.logo?.url && <Box mb={2} display='flex' justifyContent={'center'}><Image src={meta?.data?.toko?.logo?.url} style={{maxHeight:300}} fancybox /></Box>}
              <Typography gutterBottom variant='h2' component='h2'>{meta?.data.name}</Typography>
              {meta?.data.address && <Typography gutterBottom variant='body2'>{meta?.data.address}</Typography>}
              <Typography gutterBottom variant='h3' component='h3' sx={{color:status.color,mt:4}}>{status.text}</Typography>
            </Box>

            {(meta?.data.business_hour && meta?.data.business_hour.length > 0) && (
              <Box textAlign='center' mb={4} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                <Typography paragraph>{t('operational_hour')}</Typography>
                <Table sx={{width:'unset'}}>
                  <TableBody>
                    {sortBusinessHour(meta?.data.business_hour).map(b=>(
                      <TableRow>
                        <TableCell sx={{borderBottom:'unset',py:0.5}}>{t(`${b.day}`)}</TableCell>
                        <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${getDayJs(`1997-01-01 ${b.from}`).locale(locale||'en').pn_format('time')} - ${getDayJs(`1997-01-01 ${b.to}`).locale(locale||'en').pn_format('time')}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
              </Box>
            )}

            {meta?.data.description && (
              <Box mb={10}>
                <Markdown source={meta?.data.description} />
              </Box>
            )}

            <Box>
              {!data?.data && !error ? (
                <Circular />
              ) : error ? (
                <Box textAlign='center' mb={4}>
                  <Typography variant='h3' component='h3'>{error?.error?.message}</Typography>
                </Box>
              ) : typeof slug?.[0] === 'undefined' ? data?.data.map((d,i)=>(
                <Carousel enabled={isEnabled.enabled} key={d.category} data={d} />
              )) : typeof slug?.[0] !== 'undefined' && data?.data ? (
                <GridData enabled={isEnabled.enabled} data={data?.data[0]} page={page} setPage={setPage} count={data?.meta?.pagination?.pageCount||0} onBack={onBack} />
              ) : null}
            </Box>
          </Container>
        </Dashboard>
        <Cart table_number={table} enabled={isEnabled.enabled} />
      </CartContext>
    </Header>
  )
}

export default MerchantOutlet;