// material
import { Box, Grid, Container, Typography,CardContent,Card, Divider,IconButton, Stack, useMediaQuery, MenuItem, ListItemText,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress } from '@mui/material';
import {Close} from '@mui/icons-material'
import {DatePicker,LocalizationProvider} from '@mui/lab'
import AdapterDayjs from '@mui/lab/AdapterDayjs'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api'
import Button from '@comp/Button'
import Backdrop from '@comp/Backdrop'
import {Circular} from '@comp/Loading'
import Image from '@comp/Image'
import Scrollbar from '@comp/Scrollbar'
import usePagination from '@comp/TablePagination'
import {IPages, Transaction ,Toko, Wallet, SEND_ALL_CODES, Without, PAYMENT_TYPE} from '@type/index'
import wrapper from '@redux/store'
import {useTranslation} from 'next-i18next';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import Select from '@comp/Select'
import Breadcrumbs from '@comp/Breadcrumbs';
import dynamic from 'next/dynamic'
import { numberFormat } from '@portalnesia/utils';
import { getDayJs } from '@utils/Main';
import Search from '@comp/Search';
import MenuPopover from '@comp/MenuPopover';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const TextField=dynamic(()=>import('@mui/material/TextField'))

export const getServerSideProps = wrapper({name:'check_toko',outlet:{onlyMyToko:true},translation:'dash_wallet'});

const sendAllCodeArray = Object.entries(SEND_ALL_CODES);

type IForm = Without<Wallet['account'],'id'>

interface FormProps {
  input: IForm,
  setInput: (type: keyof IForm)=>(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>void
  disabled?: boolean
}

export function Form({input,setInput,disabled}: FormProps) {
  const {t} = useTranslation('dash_wallet');
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <TextField
          select
          label={t("withdraw_method")}
          value={input.bank_code}
          onChange={setInput('bank_code')}
          required
          fullWidth
          disabled={disabled}
        >
          {sendAllCodeArray.map((b)=>(
            <Select key={b[0]} value={b[0]}>{b[1]}</Select>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label={t("account_number")}
          value={input.account_number}
          onChange={setInput('account_number')}
          required
          fullWidth
          type='number'
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={t("account_name")}
          value={input.account_name}
          onChange={setInput('account_name')}
          required
          fullWidth
          disabled={disabled}
        />
      </Grid>
    </Grid>
  )
}

export default function WalletPage({meta}: IPages<Toko>) {
  const router = useRouter();
  const {t} = useTranslation('dash_wallet');
  const {t:tCom} = useTranslation('common');
  const {t:tMenu} = useTranslation('menu');
  const setNotif = useNotif();
  const toko_id = router.query?.toko_id;
  const [dialog,setDialog] = React.useState(false);
  const [loading,setLoading] = React.useState<string|null>(null);
  const [input,setInput] = React.useState<IForm>({bank_code:SEND_ALL_CODES.MANDIRI,account_name:'',account_number:''})
  const {post,put} = useAPI();
  const [query,setQuery]=React.useState<{filter:string,from:null|number,to:null|number}>({filter:'monthly',from:null,to:null})
  const [range,setRange]=React.useState({from:getDayJs().subtract(1, 'month'),to:getDayJs()})
  const [dFilter,setDFilter] = React.useState(false);
  const [dRange,setDRange] = React.useState(false);
  const [searchVal,setSearchVal] = React.useState('');
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [search,setSearch] = React.useState<Transaction[]|undefined>(undefined);
  const [wd,setWD] = React.useState(50000);
  const [dWd,setDWd] = React.useState(false)
  const is543 = useMediaQuery('(min-width:543px)')
  const {data,error,mutate} = useSWR<Wallet|null>(`/wallets/${toko_id}`,{shouldRetryOnError:(e)=>{
    return e?.httpStatus !== 404;
  }});
  const {data:historyOri,error:errHistory} = useSWR<Transaction,true>(data ? `wallets/${toko_id}/history?page=${page}&pageSize=${rowsPerPage}&filter=${query?.filter}${query?.filter === 'custom' ? `&from=${query?.from}&to=${query?.to}` : ''}` : null);
  const filterRef = React.useRef(null);
  const rangeRef = React.useRef(null);

  const history = React.useMemo(()=>{
    if(search) return search;
    if(historyOri) return historyOri.data;
    return [];
  },[historyOri,search])

  const errorWD = React.useMemo(()=>{
    let err: string[]=[];
    const max = (data?.data?.balance||0)-6500;
    if(wd < 50000) err.push(t('error_min'));
    if(wd > (max)) err.push(t('error_max',{amount:`Rp${numberFormat(`${max}`)}`}))
    return err;
  },[data,wd,t])

  const handleSearch = React.useCallback((e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
    const s = e.target.value;
    setSearchVal(s);
    if(s.length === 0) {
      setSearch(undefined);
      return;
    }
    const it = (historyOri ? historyOri.data : []).filter(f=>f.uid.toLowerCase().indexOf(s.toLowerCase()) > -1);
    setSearch(it);
  },[historyOri])

  const handleSearchRemove = React.useCallback(()=>{
    setSearchVal("")
    setSearch(undefined);
  },[])

  const handleQueryChange=React.useCallback((filter:'monthly'|'weekly'|'today'|'custom')=>()=>{
    if(filter!=='custom') {
      setQuery({filter,from:null,to:null})
      setDFilter(false);
    } else {
      const from = range.from.unix();
      const to = range.to.unix();
      setQuery({filter,from,to})
      setDFilter(false);
      setDRange(false);
    }
  },[range])

  const handleDateChange=React.useCallback((name: 'from'|'to')=>(value: any)=>{
    const val = getDayJs(value);
    if(name === 'from' && range.to.isAfter(val.add(1,'month'))) {
      setRange({
        ...range,
        to:val.add(1,'month'),
        [name]:value
      });
    } else if(name === 'to' && range.from.isBefore(val.subtract(1,'month'))) {
      setRange({
        ...range,
        from:val.subtract(1,'month'),
        [name]:value
      });
    }  else {
      setRange({
        ...range,
        [name]:value
      });
    }
  },[range])

  const handleChange=React.useCallback((name: keyof IForm)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
    setInput({...input,[name]:e.target.value});
  },[input])

  const handleSubmit = React.useCallback((type: 'post'|'put'='post')=>async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading('submit');
    try {
      if(type === 'post') await post(`/wallets/${toko_id}`,{account:input});
      else await put(`/wallets/${toko_id}`,{account:input});
      setNotif(tCom("saved"),false);
      mutate();
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[post,setNotif,input,put,tCom])

  const handleWithdraw = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    if(!data) return;
    if(!data?.data) return;
    setLoading('withdraw')
    try {
      if((data?.data?.balance||0) - 6500 < wd) throw new Error(t('not_enough_balance'));

      //const recaptcha = await captchaRef.current?.execute();
      await post(`/wallets/${toko_id}/withdraw`,{...data.data.account,amount:wd});

      setDWd(false)
      setTimeout(()=>setWD(50000),500);
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[data,wd,t,tCom]);

  React.useEffect(()=>{
    if(data && data?.data?.account) {
      setInput(data.data.account);
    }
  },[data])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Header title={t("wallet")}>
        <Dashboard withNavbar={false} backToTop={{position:'bottom',color:'primary'}} whatsappWidget={{enabled:false}}>
          <Container maxWidth='lg' sx={{mb:6}}>
            {meta?.data.name && (
              <>
                <Box>
                  <Breadcrumbs title={t("wallet")} routes={[{label:"Merchant",href:"/apps"},{label:meta?.data?.name,href:"/apps/[toko_id]",as:`/apps/${toko_id}`}]} />    
                </Box>
                <Box className='flex-header'>
                  <Button text icon='back' iconPosition='start' onClick={()=>router.back()}>{tCom("back")}</Button>
                  {!data?.data && (
                    <Button onClick={()=>setDialog(true)}>{tCom("create_ctx",{what:t("wallet")})}</Button>
                  )}
                </Box>
              </>
            )}
          </Container>
          <Container>
            {!data && !error ? (
              <Box display='flex'><Circular /></Box>
            ) : error ? (
              <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
                <Typography variant='h3' component='h3'>{error?.error.message}</Typography>
              </Box>
            ) : !data?.data ? (
              <Box>
                <Typography gutterBottom variant='h4' component='h4'>{t("no_wallet_title")}</Typography>
                <Typography gutterBottom>{t("no_wallet")}</Typography>
                <Typography gutterBottom>{t("delete")}</Typography>

                <Dialog loading={loading!==null} open={dialog} handleClose={()=>setDialog(false)}>
                  <form onSubmit={handleSubmit('post')}>
                    <DialogTitle>{tCom("create_ctx",{what:t("wallet")})}</DialogTitle>
                    <DialogContent dividers>
                      <Form input={input} setInput={handleChange} disabled={loading!==null} />
                    </DialogContent>
                    <DialogActions>
                      <Button text color='inherit' onClick={()=>setDialog(false)}>{tCom("cancel")}</Button>
                      <Button disabled={loading!==null} loading={loading==='submit'} type="submit">{tCom("save")}</Button>
                    </DialogActions>
                  </form>
                </Dialog>
              </Box>
            ) : (
              <>
                <Box pb={2} mb={5}>
                  <Typography variant="h2" component='h2'>{t("wallet")}</Typography>
                  <Divider sx={{mb:4}} />
                  <Box>
                    <form onSubmit={handleSubmit('put')}>
                      <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Card sx={{minWidth:300}}>
                                <CardContent>
                                  <Typography>{t("balance")}</Typography>
                                  <Typography variant='h4' component='h4'>{`Rp${numberFormat(`${data.data.balance}`)}`}</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Form input={input} setInput={handleChange} disabled={loading!==null} />
                        </Grid>
                      </Grid>
                      <Stack direction='row' sx={{mt:4}} alignItems="center" justifyContent='space-between'>
                        <Button disabled={loading!==null||!data} color='error' onClick={()=>setDWd(true)}>{t('withdraw')}</Button>
                        <Button type='submit' disabled={loading!==null} loading={loading==='submit'} icon='submit'>{tCom('save')}</Button>
                      </Stack>
                    </form>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h2" component='h2'>{t("history",{what:tMenu("transactions")})}</Typography>
                  <Divider sx={{mb:4}} />
                  <Card>
                    <Box sx={{p:2}}>
                      <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                        <Search autosize={is543} remove value={searchVal} onchange={handleSearch} onremove={handleSearchRemove} />
                        <Button startIcon={<Iconify icon='akar-icons:filter' />} text color='inherit' ref={filterRef} onClick={()=>setDFilter(true)}>Filter</Button>
                      </Stack>
                      <MenuPopover open={dFilter} onClose={()=>setDFilter(false)} anchorEl={filterRef.current} paperSx={{py:1,width:250}}>
                        <MenuItem sx={{ color: 'text.secondary',py:1 }} onClick={handleQueryChange('monthly')} selected={query.filter==='monthly'}>
                          <ListItemText primary={t("month")} />
                        </MenuItem>
                        <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleQueryChange('weekly')} selected={query.filter==='weekly'}>
                          <ListItemText primary={t("week")} />
                        </MenuItem>
                        <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleQueryChange('today')} selected={query.filter==='today'}>
                          <ListItemText primary={t("today")} />
                        </MenuItem>
                        <MenuItem sx={{ color: 'text.secondary',py:1 }} ref={rangeRef} onClick={()=>setDRange(true)} selected={query.filter==='custom'}>
                          <ListItemText primary={t("custom")} />
                        </MenuItem>
                      </MenuPopover>
                      <MenuPopover open={dRange} onClose={()=>setDRange(false)} anchorEl={rangeRef.current} paperSx={{py:2,px:2,width:{xs:'90%',sm:200,md:300,lg:400}}}>
                        <Grid container spacing={4}>
                          <Grid item xs={12}>
                            <DatePicker
                              disableFuture
                              label={t("from")}
                              inputFormat="DD MMMM YYYY"
                              value={range.from}
                              onChange={handleDateChange('from')}
                              renderInput={params=><TextField fullWidth {...params} />}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <DatePicker
                              disableFuture
                              label={t("to")}
                              inputFormat="DD MMMM YYYY"
                              value={range.to}
                              onChange={handleDateChange('to')}
                              renderInput={params=><TextField fullWidth {...params} />}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Button onClick={handleQueryChange('custom')}>{tCom("save")}</Button>
                          </Grid>
                        </Grid>
                      </MenuPopover>
                    </Box>
                    <Scrollbar>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell align='left'>{t("type")}</TableCell>
                            <TableCell align='left'>ID</TableCell>
                            <TableCell align='left'>Outlet</TableCell>
                            <TableCell align='left'>{t("date")}</TableCell>
                            <TableCell align='right'>{t("total",{what:tMenu('transactions')})}</TableCell>
                            <TableCell align='right'>{t("fees")}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {errHistory ? (
                            <TableRow>
                              <TableCell align="center" colSpan={6} sx={{ py: 3 }}><Typography>{errHistory?.error.message}</Typography></TableCell>
                            </TableRow>
                          ) : !historyOri && !errHistory || !history ? (
                            <TableRow>
                              <TableCell align="center" colSpan={6} sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                            </TableRow>
                          ) : history?.length === 0 ? (
                            <TableRow>
                              <TableCell align="center" colSpan={6} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("transactions")})}</Typography></TableCell>
                            </TableRow>
                          ) : history?.map((d)=>(
                            <TableRow hover>
                              <TableCell align='left'>{d.type === 'withdraw' ? t('cash_out') : t('cash_in')}</TableCell>
                              <TableCell align='left'>{d.id}</TableCell>
                              <TableCell align='left'>{d?.outlet?.name ? d.outlet.name : `-`}</TableCell>
                              <TableCell align='left'>{getDayJs(d.datetime).pn_format('full')}</TableCell>
                              <TableCell align='right'>{`Rp${numberFormat(`${d.total}`)}`}</TableCell>
                              <TableCell align='right'>{`Rp${numberFormat(`${d.platform_fees}`)}`}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                    <TablePagination
                      count={historyOri?.meta.pagination.total||0}
                      rowsPerPage={rowsPerPage}
                      page={page-1}
                      {...pagination}
                    />
                  </Card>
                </Box>
                <Dialog open={dWd} handleClose={()=>setDWd(false)}>
                  <form onSubmit={handleWithdraw}>
                    <DialogTitle>
                      <Stack direction='row' justifyContent={'space-between'} alignItems='center' spacing={2}>
                        <Typography variant='h6'>{t("withdraw")}</Typography>
                        <IconButton onClick={()=>setDWd(false)}><Close /></IconButton>
                      </Stack>
                    </DialogTitle>
                    <DialogContent dividers>
                      <Grid container spacing={4}>
                        <Grid item xs={12}>
                          <TextField
                            label={t('amount')}
                            value={wd}
                            onChange={(e)=>setWD(Number(e.target.value))}
                            type='number'
                            inputProps={{min:50000,max:((data?.data?.balance||0)-6500)}}
                            fullWidth
                            autoFocus
                            error={errorWD.length > 0}
                            helperText={
                              <>
                                {errorWD.map((t,i)=>(
                                  <Typography variant='caption' component='p' key={`error-${i}`}>{t}</Typography>
                                ))}
                              </>
                            }
                          />
                        </Grid>
                      </Grid>
                    </DialogContent>
                    <DialogActions>
                      <Button icon='submit' loading={loading==='withdraw'} disabled={loading!==null||errorWD.length > 0} type='submit'>Submit</Button>
                    </DialogActions>
                  </form>
                </Dialog>
              </>
            )}
          </Container>
        </Dashboard>
      </Header>
    </LocalizationProvider>
  )
}