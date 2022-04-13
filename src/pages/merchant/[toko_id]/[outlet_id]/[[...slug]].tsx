import React from 'react'
import { Box, Grid, Container, Typography, Stack } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import Image from '@comp/Image'
import {useTranslations} from 'next-intl';
import useSWR from '@utils/swr'
import {Circular} from '@comp/Loading'
import Iconify from '@comp/Iconify'
import wrapper from '@redux/store'
import { IOutletPagination, IPages, ResponsePagination,IMenu, IProduct } from '@type/index';
import { useRouter } from 'next/router';
import useToko from '@utils/useToko';
import { photoUrl } from '@utils/Main';
import Pagination,{usePagination} from '@comp/Pagination'
import useOutlet from '@utils/useOutlet';
import { Markdown } from '@comp/Parser';
import Scrollbar from '@comp/Scrollbar'
import { numberFormat, ucwords } from '@portalnesia/utils';
import Products from '@sections/Products';
import Button from '@comp/Button';
import CartContext from '@redux/cart'
import Cart from '@comp/Cart';
import SessionStorage from '@utils/session-storage';

export const getServerSideProps = wrapper(async({checkOutlet,params,redirect})=>{
  const slug = params?.slug;
  if(typeof slug?.[1] !== 'undefined') {
    return redirect();
  }
  return await checkOutlet({onlyMyToko:false});
});

interface CarouselProps {
  data: IMenu
}

function Carousel({data}: CarouselProps) {
  const t = useTranslations();
  const router = useRouter();
  const {toko_id,outlet_id,slug} = router.query;
  return (
    <>
      <Stack mb={4} direction='row' justifyContent={'space-between'} alignItems='center' spacing={2} sx={{pb:1,mb:4,borderBottom:(theme)=>`1px solid ${theme.palette.divider}`}}>
        <Typography variant='h3' component='h3'>{data.category}</Typography>
        {!slug && data.data.length >= 5 && (
          <Button size='small' onClick={()=>router.replace(`/merchant/[toko_id]/[outlet_id]/[[...slug]]`,`/merchant/${toko_id}/${outlet_id}/${data.category.toLowerCase()}`,{shallow:true})}>{t("Payment.view_more")}</Button>
        )}
      </Stack>
      <Box>
        <Scrollbar>
          <Box display='flex' flexDirection="row" alignItems="center">
            {data.data.map((d,i)=>(
              <Box px={1}><Products maxWidth items={d} /></Box>
            ))}
          </Box>
        </Scrollbar>
      </Box>
    </>
  )
}

interface GridDataProps {
  data: ResponsePagination<IProduct>
  page: number,
  setPage(_e:any,p:number): void
  count: number
}
function GridData({data,page,setPage,count}: GridDataProps) {
  const t = useTranslations();
  const router = useRouter();
  const {toko_id,outlet_id,slug} = router.query;

  return (
    <>
      <Stack mb={4} direction='row' justifyContent={'space-between'} alignItems='center' spacing={2} sx={{pb:1,mb:4,borderBottom:(theme)=>`1px solid ${theme.palette.divider}`}}>
        <Typography variant='h3' component='h3'>{ucwords(slug?.[0] as string)}</Typography>
        {typeof slug?.[0] === 'string' && (
          <Button size='small' onClick={()=>router.replace(`/merchant/[toko_id]/[outlet_id]/[[...slug]]`,`/merchant/${toko_id}/${outlet_id}`,{shallow:true})}>{t("General.back")}</Button>
        )}
      </Stack>
      <Box>
        <Grid container spacing={4}>
          {data.data.map((d,i)=>(
            <Grid item xs={12} sm={6} md={4} lg={3} key={`product-${d.id}`}>
              <Products items={d} />
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

export default function MerchantOutlet({meta}: IPages) {
  const t = useTranslations();
	const router = useRouter();
	const {toko_id,outlet_id,slug,table_number} = router.query;
  const {outlet,errOutlet} = useOutlet(toko_id,outlet_id);
  const [page,setPage] = usePagination(true);
  const {data,error} = useSWR<IMenu[]|ResponsePagination<IProduct>>(typeof slug?.[0] === 'undefined' ? `/toko/${toko_id}/${outlet_id}/menu` : `/toko/${toko_id}/${outlet_id}/menu/${slug?.[0]?.toLowerCase()}?page=${page}&per_page=25`)
  const [table,setTable] = React.useState<string|undefined>();

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

  return (
    <Header title={meta?.title} desc={meta?.description} image={meta?.image}>
      <CartContext>
        <Dashboard withDashboard={false}>
          <Container maxWidth='lg' sx={{mt:2}}>
            {!outlet && !errOutlet ? (
              <Box display='flex' position='absolute' top='40%' left='50%' alignItems={'center'} justifyContent='center'><Circular /></Box>
            ) : errOutlet ? (
              <Box textAlign='center' mb={4}>
                <Typography variant='h3' component='h3'>{errOutlet?.message}</Typography>
              </Box>
            ) : outlet ? (
              <>
                <Box textAlign='center' mb={4}>
                  {outlet?.toko?.logo && <Box mb={2}><Image src={`${photoUrl(outlet?.toko?.logo)}&watermark=no&export=banner&size=300&no_twibbon=true`} withPng fancybox /></Box>}
                  <Typography gutterBottom variant='h2' component='h2'>{outlet.name}</Typography>
                  {outlet.address && <Typography variant='body2'>{outlet.address}</Typography>}
                </Box>

                {outlet.description && (
                  <Box mb={10}>
                    <Markdown source={outlet.description} />
                  </Box>
                )}

                <Box>
                  {!data && !error ? (
                    <Circular />
                  ) : error ? (
                    <Box textAlign='center' mb={4}>
                      <Typography variant='h3' component='h3'>{error?.message}</Typography>
                    </Box>
                  ) : Array.isArray(data) ? data.map((d,i)=>(
                    <Carousel key={d.category} data={d} />
                  )) : data && 'total' in data ? (
                    <GridData data={data} page={page} setPage={setPage} count={data?.total_page||0} />
                  ) : null}
                </Box>
              </>
            ) : null}
          </Container>
        </Dashboard>
        <Cart table_number={table} />
      </CartContext>
    </Header>
  )
}