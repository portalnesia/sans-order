// material
import { Box, Grid, Container, Typography,Table,TableBody,TableRow,TableCell,TableHead,TableFooter, Stack, Card } from '@mui/material';
import {Download} from '@mui/icons-material'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import React from 'react'
import Image from '@comp/Image'
import {useTranslation} from 'next-i18next';
import Label from '@comp/Label';
import Button from '@comp/Button';
import Iconify from '@comp/Iconify';
import wrapper from '@redux/store'
import { IPages,ResponsePagination,TransactionsDetail,colorOrderStatus,colorStatus,ITransaction } from '@type/index';
import useSWR from '@utils/swr';
import { Circular } from '@comp/Loading';
import handlePrint from '@utils/print';
import Scrollbar from '@comp/Scrollbar';
import { numberFormat } from '@portalnesia/utils';
import { ISocket,withSocket } from '@utils/Socket';

export const getServerSideProps = wrapper({name:'check_transactions',translation:'dash_tr'});



function TransactionsPage({meta,socket}: IPages & {socket?: ISocket}) {
  const {t} = useTranslation('dash_tr')
  const {t:tCom} = useTranslation('common');
  const {t:tMenu} = useTranslation('menu')

  const {data,error,mutate} = useSWR<TransactionsDetail>(`/toko/transactions/${meta?.slug}`);

  const onPrint = React.useCallback(()=>{
    if(data && data?.toko && data?.token_print) {
      handlePrint(data.toko.toko.slug,`${data.toko.id}`,data.token_print,'action=pdf');
    }
  },[data])

  React.useEffect(()=>{
    async function handleTransactionChange(dt: ITransaction) {
      if(data?.id == dt.id) mutate();
    }
    
    if(data?.toko) {
      socket?.emit('toko outlet',{toko_id:data.toko.toko.slug,outlet_id:data.toko.id,debug:process.env.NODE_ENV!=='production'})
    }
    socket?.on('toko transactions',handleTransactionChange)
    socket?.on('toko transactions orderstatus',handleTransactionChange)
    return ()=>{
      socket?.off('toko transactions',handleTransactionChange)
      socket?.off('toko transactions orderstatus',handleTransactionChange)
    }
  },[data,socket])

  return (
    <Header title={`${tMenu('transactions')} #${meta?.slug}`}>
      <Dashboard withDashboard={false}>
        <Container maxWidth='lg' sx={{mt:2}}>
          {!data && !error ? (
						<Box display='flex' position='absolute' top='40%' left='50%' alignItems={'center'} justifyContent='center'><Circular /></Box>
					) : error ? (
						<Box textAlign='center' mb={4}>
							<Typography variant='h3' component='h3'>{error?.message}</Typography>
						</Box>
					) :  data ? (
            <>
              <Stack sx={{mb:3}} direction='row' alignItems='center' justifyContent='space-between'>
                <Typography variant='h3' component='h3'>{tMenu('transactions')}</Typography>
                <Button text color='inherit' icon='download' iconPosition='start' onClick={onPrint}>{`Download ${t("receipt")}`}</Button>
              </Stack>
              <Table sx={{width:'unset'}}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{borderBottom:'unset',py:1}}>{t("id",{what:tMenu('transactions')})}</TableCell>
                    <TableCell sx={{borderBottom:'unset',py:1}}>{data?.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{borderBottom:'unset',py:1}}>{t("payment_method")}</TableCell>
                    <TableCell sx={{borderBottom:'unset',py:1}}><Label variant='filled' color='info'>{data.payment}</Label></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{borderBottom:'unset',py:1}}>{t("payment_status")}</TableCell>
                    <TableCell sx={{borderBottom:'unset',py:1}}><Label variant='filled' color={colorStatus[data.status]}>{data.status}</Label></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{borderBottom:'unset',py:1}}>{t("order_status")}</TableCell>
                    <TableCell sx={{borderBottom:'unset',py:1}}><Label variant='filled' color={colorOrderStatus[data.order_status]}>{data.order_status}</Label></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Box mt={8}>
                <Typography sx={{mb:2}} variant='h3' component='h3'>{tMenu('products')}</Typography>
                <Card>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell align='center' colSpan={4}>{tMenu("products")}</TableCell>
                          <TableCell rowSpan={2} align='right'>Subtotal</TableCell>
                          <TableCell rowSpan={2} align='right'>{t("disscount")}</TableCell>
                          <TableCell rowSpan={2} align='right'>Total</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>{tCom("name")}</TableCell>
                          <TableCell align='right'>{t("price")}</TableCell>
                          <TableCell align='right'>{t("disscount")}</TableCell>
                          <TableCell align='right'>Qty</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.items.map((d)=>{
                          const subtotal = d.price*d.qty;
                          const disscount = d.disscount*d.qty;
                          const total = subtotal-disscount;
                          return (
                            <TableRow hover key={`items-${data.id}-${d.id}`}>
                              <TableCell>{`${d.name}`}</TableCell>
                              <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${d.price}`)}`}</TableCell>
                              <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${d.disscount}`)}`}</TableCell>
                              <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{d.qty}</TableCell>
                              <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${subtotal}`)}`}</TableCell>
                              <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${disscount}`)}`}</TableCell>
                              <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${total}`)}`}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </Card>
              </Box>
            </>
          ) : null}
        </Container>
      </Dashboard>
    </Header>
  )
}

export default withSocket(TransactionsPage);