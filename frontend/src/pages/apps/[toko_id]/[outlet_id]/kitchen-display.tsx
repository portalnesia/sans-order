// material
import { Box, Typography,Card,Stack,CardHeader, CardContent, FormGroup, FormControlLabel, Checkbox, CardActions } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard, { APP_BAR_DESKTOP, APP_BAR_MOBILE } from '@layout/home/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api'
import Button from '@comp/Button'
import {IPages,Transaction,Outlet} from '@type/index'
import wrapper from '@redux/store'
import {useTranslation} from 'next-i18next';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Scrollbar from '@comp/Scrollbar'
import { ISocket, withSocket } from '@utils/Socket';
import { Circular } from '@comp/Loading';
import { KeyedMutator } from 'swr';
import { StrapiResponse } from '@portalnesia/portalnesia-strapi';

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['Kitchen']},translation:'dash_tr'})

function MenuCard({data,mutate}: {data: Transaction<{table_number?: string}>,mutate: KeyedMutator<StrapiResponse<Transaction<{table_number?: string | undefined}, any>, true, any>>}) {
  const {t} = useTranslation('dash_tr')
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const setNotif = useNotif();
  const {outlet_id} = router.query;
  const [loading,setLoading] = React.useState(false);
  const {put} = useAPI();
  const [input,setInput] = React.useState(()=>Object.values(data.items)?.map(i=>({
    id:i.id,
    done:!!i?.done
  })))

  const onCheckedChange = React.useCallback((id: number)=>(e: any,checked: boolean)=>{
    const items = [...input];
    const index = items.findIndex(i=>i.id === id);
    if(index > -1) {
      items[index].done = checked;
    }
    setInput(items);
  },[input])

  const handleSave = React.useCallback(async()=>{
    setLoading(true);
    try {
      await put(`/transactions/outlet/${outlet_id}/${data.id}/kitchen`,{items:input});
      mutate();
      setNotif(tCom("saved"),false)
      mutate();
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[put,outlet_id,data,setNotif,tCom,input,mutate])

  return (
    <Card sx={{mx:1,height:{xs:`calc(100vh - ${APP_BAR_MOBILE + 45}px)`,lg:`calc(100vh - ${APP_BAR_DESKTOP + 45}px)`},minWidth:400}}>
      <CardHeader title={`#${data?.uid}`} subheader={data.metadata?.table_number ? `Table: ${data.metadata?.table_number}` : undefined} />
      <CardContent sx={{height:{xs:`calc(100vh - ${APP_BAR_MOBILE + 45}px - 52px - 87px)`,lg:`calc(100vh - ${APP_BAR_DESKTOP + 45}px - 52px - 87px)`,overflow:'auto'}}}>
        <FormGroup>
          {Object.values(data.items)?.map((item)=>{
            const checked = !!(input.find(i=>i.id === item.id)?.done);
            return (
              <Stack key={`item-${item.id}`} direction='row' spacing={1} justifyContent='space-between' alignItems='center'>
                <Box>
                  <FormControlLabel key={item.id} control={<Checkbox checked={checked} onChange={onCheckedChange(item.id)} />} label={
                    <>
                      <Typography>{item?.item.name}</Typography>
                      
                    </>
                  } />
                  { item?.notes && <Typography variant='caption'>{item?.notes}</Typography>}
                </Box>
                <Typography variant='caption'>{`${item?.qty} pcs`}</Typography>
              </Stack>
            )
          })}
        </FormGroup>
      </CardContent>
      <CardActions sx={{position:'absolute',bottom:8,width:'100%',alignItems:'flex-end',justifyContent:'flex-end'}}>
        <Button disabled={loading} icon='save' loading={loading} onClick={handleSave}>{t('save')}</Button>
      </CardActions>
    </Card>
  )
}

function OutletKitchenDisplay({socket}: IPages<Outlet> & {socket?: ISocket}) {
  const {t:tCom} = useTranslation('common');
  const {t:tMenu} = useTranslation('menu')
  const router = useRouter();
  const {outlet_id} = router.query;
  const [page,setPage] = React.useState(1);
  const {data,error,mutate} = useSWR<Transaction<{table_number?: string}>,true>(`/transactions/outlet/${outlet_id}/kitchen?pagination[page]=${page}`);

  React.useEffect(()=>{
    async function handleTransactionChange(_: Transaction) {
      mutate();
    }

    socket?.on('toko transactions',handleTransactionChange)
    socket?.on('toko transactions items',handleTransactionChange)
    socket?.on('toko transactions orderstatus',handleTransactionChange)
    return ()=>{
      socket?.off('toko transactions',handleTransactionChange)
      socket?.off('toko transactions items',handleTransactionChange)
      socket?.off('toko transactions orderstatus',handleTransactionChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[socket])

  return (
    <Header title={`${tMenu('kitchen_view')}`}>
      <Dashboard withDashboard={false} withFooter={false} withPadding={false} withNavbar={false} backToTop={{enabled:false}} whatsappWidget={{enabled:false}} sx={{pt:{xs:`${APP_BAR_MOBILE + 24}px`,lg:`${APP_BAR_DESKTOP + 24}px`}}}>
        {!data && !error ? (
          <Box display='flex' position='absolute' top='40%' left='50%' alignItems={'center'} justifyContent='center'><Circular /></Box>
        ) : error ? (
          <Box textAlign='center' mb={4}>
            <Typography variant='h3' component='h3'>{error?.error.message}</Typography>
          </Box>
        ) : data?.data.length === 0 ? (
          <Box textAlign='center' mb={4}>
            <Typography variant='h3' component='h3'>{tCom("no_what",{what:tMenu("transactions")})}</Typography>
          </Box>
        ) : (
          <Box px={2}>
            <Scrollbar>
              <Box display='flex' flexDirection="row" alignItems="center">
                {data?.data.map((d,i)=>(
                  <MenuCard key={`card-${d.id}`} data={d} mutate={mutate} />
                ))}
              </Box>
            </Scrollbar>
          </Box>
        )}
      </Dashboard>
    </Header>
  )
}

//export default OutletKitchenDisplay;
export default withSocket(OutletKitchenDisplay,{dashboard:false,view:'kitchen display'});