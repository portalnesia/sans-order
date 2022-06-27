// material
import { Box, Grid, Container, Typography,IconButton,TextField, Card,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText,Collapse, Portal } from '@mui/material';
import {ExpandMore as ExpandMoreIcon,Close} from '@mui/icons-material'
import {DatePicker,LocalizationProvider} from '@mui/lab'
import AdapterDayjs from '@mui/lab/AdapterDayjs'
import useMediaQuery from '@mui/material/useMediaQuery'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
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
import MenuPopover from '@comp/MenuPopover'
import Scrollbar from '@comp/Scrollbar'
import Search from '@comp/Search'
import usePagination from '@comp/TablePagination'
import Label from '@comp/Label'
import ExpandMore from '@comp/ExpandMore'
import dynamic from 'next/dynamic'
import { numberFormat } from '@portalnesia/utils';
import { getDayJs } from '@utils/Main';
import handlePrint from '@utils/print';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true,onlyAccess:['transactions']},translation:'dash_tr'})

interface IMenu {
  data: TransactionsDetail
  disabled?: boolean
  onDetail(): void
}

function Menu({data,disabled,onDetail}: IMenu) {
  const {t} = useTranslation('dash_tr');
  const ref=React.useRef(null);
  const [open,setOpen] = React.useState(false);
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;

  const onPrint=React.useCallback((e: React.MouseEvent)=>{
    e.stopPropagation();
    if(data.token_print) {
      handlePrint(toko_id as string,outlet_id as string,data.token_print);
    }
    setOpen(false)
  },[data.token_print,toko_id,outlet_id])

  const handleDetail = React.useCallback(()=>{
    setOpen(false)
    onDetail()
  },[onDetail])

  return (
    <>
      <IconButton ref={ref} onClick={(e) =>{e.stopPropagation(),setOpen(true)}}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <MenuPopover open={open} onClose={()=>setOpen(false)} anchorEl={ref.current} paperSx={{py:1}} onBackdropClick={(e)=>{e.stopPropagation(),setOpen(false)}}>
        <MenuItem disabled={!!disabled} sx={{ color: 'text.secondary',py:1 }} onClick={handleDetail}>
          <ListItemIcon>
            <Iconify icon="ep:warning" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Detail" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
        <MenuItem disabled={!!disabled} sx={{ color: 'text.secondary',py:1 }} onClick={onPrint}>
          <ListItemIcon>
            <Iconify icon="fluent:print-20-filled" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary={t("print")} primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </MenuPopover>
    </>
  )
}

export function TableTr({data}: {data: TransactionsDetail}) {
  const {t} = useTranslation('dash_tr');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const locale = router.locale
  const [expand,setExpand] = React.useState(false);

  const onDetail = React.useCallback((e?: React.MouseEvent<HTMLTableRowElement>)=>{
    const target = e?.target as unknown as EventTarget & HTMLTableRowElement;
    if(target) {
      if(target?.nodeName?.toLowerCase() === 'td') setExpand(true)
    } else {
      setExpand(true)
    }
  },[])

  const date = React.useMemo(()=>{
    return getDayJs(data.timestamp).locale(locale||'en').pn_format('full')
  },[data.timestamp,locale])

  return (
    <>
      <TableRow
        key={`transactions-${data.id}`}
        tabIndex={-1}
        hover
        onClick={onDetail}
        sx={{cursor:'pointer'}}
      >
        <TableCell sx={{whiteSpace:'nowrap'}}>{data.id}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}}>{date}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${data.subtotal}`)}`}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${data.disscount}`)}`}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${data.total}`)}`}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='center'><Menu data={data} onDetail={onDetail} /></TableCell>
      </TableRow>
      <Portal>
        <Dialog open={expand} handleClose={()=>setExpand(false)} maxWidth='lg'>
          <DialogTitle>
            <Stack direction='row' justifyContent={'space-between'} alignItems='center' spacing={2}>
              <Typography variant='h6'>{`#${data.id}`}</Typography>
              <IconButton onClick={()=>setExpand(false)}><Close /></IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Box sx={{m:1,mb:8}}>
              <Box sx={{mb:4}}>
                <Typography paragraph variant='h6' component='h6'>Detail</Typography>
                <Table>
                  <TableBody>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{tMenu("cashier")}</TableCell>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{data.cashier}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{t("type")}</TableCell>
                      <TableCell sx={{borderBottom:'unset',py:1}}><Label variant='filled' color='default'>{data.type.toUpperCase()}</Label></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{t("payment_method")}</TableCell>
                      <TableCell sx={{borderBottom:'unset',py:1}}><Label variant='filled' color='info'>{data.payment}</Label></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{t("payment_status")}</TableCell>
                      <TableCell sx={{borderBottom:'unset',py:1}}><Label variant='filled' color={colorStatus[data.status]}>{data.status}</Label></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{t("order_status")}</TableCell>
                      <TableCell sx={{borderBottom:'unset',py:1}}><Label variant='filled' color={colorOrderStatus[data.order_status]}>{data.order_status}</Label></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} sx={{pt:4,pl:0,borderBottom:'unset'}}><Typography variant='h6' component='h6'>{tMenu("customer")}</Typography></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{tCom("name")}</TableCell>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{data.user ? data.user.name : '-'}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset',py:1}}>Email</TableCell>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{data?.user?.email ? data.user.email : '-'}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset',py:1}}>Telephone</TableCell>
                      <TableCell sx={{borderBottom:'unset',py:1}}>{data?.user?.telephone ? data.user.telephone : '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
              <Box>
                <Typography variant='h6' component='h6'>{t("detail",{what:tMenu("order")})}</Typography>
              </Box>
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
                          <TableCell>
                            <Typography>{`${d.name}`}</Typography>
                            {d?.notes && <Typography variant='caption'>{d?.notes}</Typography>}
                          </TableCell>
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
            </Box>
          </DialogContent>
        </Dialog>
      </Portal>
    </>
  )
}

export default function OutletTransactions({meta}: IPages){
  const {t} = useTranslation('dash_tr');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const {get} = useAPI();
  const {toko_id,outlet_id} = router.query;
  const [loading,setLoading] = React.useState<string|null>(null)
  const setNotif = useNotif();
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const [query,setQuery]=React.useState<{filter:string,from:null|number,to:null|number}>({filter:'monthly',from:null,to:null})
  const [range,setRange]=React.useState({from:getDayJs().subtract(1, 'month'),to:getDayJs()})
  const [dFilter,setDFilter] = React.useState(false);
  const [dRange,setDRange] = React.useState(false);
  const [searchVal,setSearchVal] = React.useState('');
  const [search,setSearch] = React.useState<TransactionsDetail[]|undefined>(undefined);
  const is543 = useMediaQuery('(min-width:543px)')
  const {data,error} = useSWR<ResponsePagination<TransactionsDetail>>(`/sansorder/toko/${toko_id}/${outlet_id}/transactions?page=${page}&per_page=${rowsPerPage}&filter=${query?.filter}${query?.filter === 'custom' ? `&from=${query?.from}&to=${query?.to}` : ''}`)

  const items = React.useMemo(()=>{
    if(search) return search;
    if(data) return data.data;
    return [];
  },[data,search])

  const filterRef = React.useRef(null);
  const rangeRef = React.useRef(null);

  const handleSearch = React.useCallback((e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
    const s = e.target.value;
    setSearchVal(s);
    if(s.length === 0) {
      setSearch(undefined);
      return;
    }
    const it = (data ? data.data : []).filter(f=>f.id.toLowerCase().indexOf(s.toLowerCase()) > -1);
    setSearch(it);
  },[data])

  const handleSearchRemove = React.useCallback(()=>{
    setSearchVal("")
    setSearch(undefined);
  },[])

  const handleChange=React.useCallback((filter:'monthly'|'weekly'|'today'|'custom')=>()=>{
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

  const handleDownload=React.useCallback(async()=>{
    setLoading('download')
    try {
      const url = await get<string>(`/sansorder/toko/${toko_id}/${outlet_id}/export?filter=${query?.filter}${query?.filter === 'custom' ? `&from=${query?.from}&to=${query?.to}` : ''}`);
      const urlEdit = url.replace("https://api.portalnesia.com",process.env.NEXT_PUBLIC_URL as  string);
      window.location.href=urlEdit;
    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[query,get,setNotif,toko_id,outlet_id,tCom])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Header title={`${tMenu("transactions")} - ${meta?.title}`} desc={meta?.description}>
        <Dashboard title={meta?.title} subtitle={meta?.toko_name} view='dashboard transactions'>
          <Container>
            <Box pb={2} mb={5}>
              <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                <Typography variant="h3" component='h3'>{tMenu("transactions")}</Typography>
                <Button startIcon={<Iconify icon='akar-icons:filter' />} text color='inherit' ref={filterRef} onClick={()=>setDFilter(true)}>Filter</Button>
              </Stack>
              <MenuPopover open={dFilter} onClose={()=>setDFilter(false)} anchorEl={filterRef.current} paperSx={{py:1,width:250}}>
                <MenuItem sx={{ color: 'text.secondary',py:1 }} onClick={handleChange('monthly')} selected={query.filter==='monthly'}>
                  <ListItemText primary={t("month")} />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleChange('weekly')} selected={query.filter==='weekly'}>
                  <ListItemText primary={t("week")} />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleChange('today')} selected={query.filter==='today'}>
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
                    <Button onClick={handleChange('custom')}>{tCom("save")}</Button>
                  </Grid>
                </Grid>
              </MenuPopover>
            </Box>
            <Card>
              <Box sx={{p:2}}>
                <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                  <Search autosize={is543} remove value={searchVal} onchange={handleSearch} onremove={handleSearchRemove} />
                  <Button icon='download' disabled={loading!==null} loading={loading==='download'} onClick={handleDownload}>Download</Button>
                </Stack>
              </Box>
              <Scrollbar>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align='left'>ID</TableCell>
                      <TableCell align='left'>{t("date")}</TableCell>
                      <TableCell align='right'>Subtotal</TableCell>
                      <TableCell align='right'>{t("disscount")}</TableCell>
                      <TableCell align='right'>Total</TableCell>
                      <TableCell align='center'></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {error ? (
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}><Typography>{error?.message}</Typography></TableCell>
                      </TableRow>
                    ) : !data && !error || !items ? (
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                      </TableRow>
                    ) : items?.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("transactions")})}</Typography></TableCell>
                      </TableRow>
                    ) : items?.map((d)=>(
                      <TableTr key={`transaction-${d.id}`} data={d} />
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
              <TablePagination
                count={data?.total||0}
                rowsPerPage={rowsPerPage}
                page={page-1}
                {...pagination}
              />
            </Card>
          </Container>
        </Dashboard>
      </Header>
    </LocalizationProvider>
  )
}