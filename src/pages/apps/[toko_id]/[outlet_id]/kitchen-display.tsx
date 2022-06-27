// material
import { Box, Typography,TextField, Card,Stack,Collapse, Portal, CardHeader, CardContent, FormGroup, FormControlLabel, Checkbox, CardActions } from '@mui/material';
import {ExpandMore as ExpandMoreIcon,Close} from '@mui/icons-material'
import useMediaQuery from '@mui/material/useMediaQuery'
// components
import Header from '@comp/Header';
import Dashboard, { APP_BAR_DESKTOP, APP_BAR_MOBILE } from '@layout/home/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/portalnesia'
import Button from '@comp/Button'
import {IPages,ResponsePagination,TransactionsDetail,colorOrderStatus,colorStatus} from '@type/index'
import wrapper from '@redux/store'
import {useTranslation} from 'next-i18next';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import Scrollbar from '@comp/Scrollbar'
import Search from '@comp/Search'
import usePagination from '@comp/TablePagination'
import Label from '@comp/Label'
import ExpandMore from '@comp/ExpandMore'
import dynamic from 'next/dynamic'
import { numberFormat } from '@portalnesia/utils';
import { getDayJs } from '@utils/Main';
import { ISocket, withSocket } from '@utils/Socket';
import { Circular } from '@comp/Loading';
import { KeyedMutator } from 'swr';
import Recaptcha from '@comp/Recaptcha';

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['transactions']},translation:'dash_tr'})

function MenuCard({data,mutate,captchaRef}: {data: TransactionsDetail<{table_number?: string}>,mutate: KeyedMutator<ResponsePagination<TransactionsDetail>>,captchaRef: React.RefObject<Recaptcha>}) {
  const {t} = useTranslation('dash_tr')
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const setNotif = useNotif();
  const {toko_id,outlet_id} = router.query;
  const [loading,setLoading] = React.useState(false);
  const {put} = useAPI();
  const [input,setInput] = React.useState(()=>data.items.map(i=>({
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
      const recaptcha = await captchaRef.current?.execute();
      await put(`/sansorder/toko/${toko_id}/${outlet_id}/transactions/${data.id}/items`,{items:input,recaptcha});
      mutate();
      setNotif(tCom("saved"),false)
      mutate();
    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[put,toko_id,outlet_id,data,setNotif])

  return (
    <Card sx={{mx:1,height:{xs:`calc(100vh - ${APP_BAR_MOBILE + 45}px)`,lg:`calc(100vh - ${APP_BAR_DESKTOP + 45}px)`},minWidth:300}}>
      <CardHeader title={`#${data?.id}`} subheader={data.metadata?.table_number ? `Table: ${data.metadata?.table_number}` : undefined} />
      <CardContent sx={{height:{xs:`calc(100vh - ${APP_BAR_MOBILE + 45}px - 52px - 87px)`,lg:`calc(100vh - ${APP_BAR_DESKTOP + 45}px - 52px - 87px)`,overflow:'auto'}}}>
        <FormGroup>
          {data.items?.map((item)=>{
            const checked = !!(input.find(i=>i.id === item.id)?.done);
            return (
              <FormControlLabel key={item.id} control={<Checkbox checked={checked} onChange={onCheckedChange(item.id)} />} label={
                <>
                  <Typography>{item?.name}</Typography>
                  { item?.notes && <Typography variant='caption'>{item?.notes}</Typography>}
                </>
              } />
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

function OutletKitchenDisplay({socket}: IPages & {socket?: ISocket}) {
  const {t:tCom} = useTranslation('common');
  const {t:tMenu} = useTranslation('menu')
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const [page,setPage] = React.useState(1);
  const {data,error,mutate} = useSWR<ResponsePagination<TransactionsDetail<{table_number?: string}>>>(`/sansorder/toko/${toko_id}/${outlet_id}/transactions/kitchen?page=${page}`);
  const captchaRef = React.useRef<Recaptcha>(null);

  React.useEffect(()=>{
    async function handleTransactionChange(_: TransactionsDetail) {
      mutate();
    }

    socket?.on('toko transactions',handleTransactionChange)
    socket?.on('toko transactions orderstatus',handleTransactionChange)
    return ()=>{
      socket?.off('toko transactions',handleTransactionChange)
      socket?.off('toko transactions orderstatus',handleTransactionChange)
    }
  },[socket])

  return (
    <Header title={`${tMenu('kitchen_view')}`}>
      <Dashboard withDashboard={false} withFooter={false} withPadding={false} withNavbar={false} backToTop={{enabled:false}} whatsappWidget={{enabled:false}} sx={{pt:{xs:`${APP_BAR_MOBILE + 24}px`,lg:`${APP_BAR_DESKTOP + 24}px`}}}>
        {!data && !error ? (
          <Box display='flex' position='absolute' top='40%' left='50%' alignItems={'center'} justifyContent='center'><Circular /></Box>
        ) : error ? (
          <Box textAlign='center' mb={4}>
            <Typography variant='h3' component='h3'>{error?.message}</Typography>
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
                  <MenuCard key={`card-${d.id}`} data={d} mutate={mutate} captchaRef={captchaRef} />
                ))}
              </Box>
            </Scrollbar>
          </Box>
        )}
      </Dashboard>
      <Recaptcha ref={captchaRef} />
    </Header>
  )
}

//export default OutletKitchenDisplay;
export default withSocket(OutletKitchenDisplay,{dashboard:false,view:'kitchen display'});