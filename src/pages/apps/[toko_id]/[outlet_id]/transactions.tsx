// material
import { Box, Grid, Container, Typography,Tooltip,IconButton,TextField, Card, FormControlLabel, Switch,Checkbox,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,MenuItem,ListItemIcon,ListItemText,Collapse } from '@mui/material';
import {ExpandMore as ExpandMoreIcon} from '@mui/icons-material'
import {DatePicker,LocalizationProvider} from '@mui/lab'
import AdapterDayjs from '@mui/lab/AdapterDayjs'
import useMediaQuery from '@mui/material/useMediaQuery'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/dashboard/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/portalnesia'
import Recaptcha from '@comp/Recaptcha'
import Button from '@comp/Button'
import Backdrop from '@comp/Backdrop'
import Image from '@comp/Image'
import Popover from '@comp/Popover'
import {IPages,ResponsePagination,TransactionsDetail,colorOrderStatus,colorStatus} from '@type/index'
import wrapper from '@redux/store'
import {useTranslations} from 'next-intl';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import MenuPopover from '@comp/MenuPopover'
import useOutlet from '@utils/useOutlet'
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
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'))
const Browser = dynamic(()=>import('@comp/Browser'),{ssr:false})

export const getServerSideProps = wrapper({name:'check_outlet',outlet:{onlyMyToko:true}})

interface IMenu {
  data: TransactionsDetail
  disabled?: boolean
}

function Menu({data,disabled}: IMenu) {
  const ref=React.useRef(null);
  const [open,setOpen] = React.useState(false);
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;

  const onPrint=React.useCallback(()=>{
    if(data.token_print) {
      handlePrint(toko_id as string,outlet_id as string,data.token_print);
    }
  },[data.token_print,toko_id,outlet_id])

  return (
    <>
      <IconButton ref={ref} onClick={() => setOpen(true)}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <MenuPopover open={open} onClose={()=>setOpen(false)} anchorEl={ref.current} paperSx={{py:1}}>
        <MenuItem disabled={!!disabled} sx={{ color: 'text.secondary',py:1 }} onClick={onPrint}>
          <ListItemIcon>
            <Iconify icon="fluent:print-20-filled" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Print" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </MenuPopover>
    </>
  )
}

function TableTr({data}: {data: TransactionsDetail}) {
  const t = useTranslations();
  const router = useRouter();
  const locale = router.locale
  const [expand,setExpand] = React.useState(false);

  const date = React.useMemo(()=>{
    return getDayJs(data.timestamp).locale(locale||'en').pn_format('full')
  },[data.timestamp,locale])

  return (
    <>
      <TableRow
        key={`transactions-${data.id}`}
        tabIndex={-1}
      >
        <TableCell>
          <ExpandMore expand={expand} onClick={()=>setExpand(!expand)}>
            <ExpandMoreIcon />
          </ExpandMore>
        </TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}}>{data.id}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}}>{date}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${data.subtotal}`)}`}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${data.disscount}`)}`}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${data.total}`)}`}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='center'><Menu data={data} /></TableCell>
      </TableRow>
      <TableRow key={`transactions-details-${data.id}`} tabIndex={-1}>
        <TableCell colSpan={7} sx={{py:0}}>
          <Collapse in={expand} timeout='auto' unmountOnExit>
            <Box sx={{m:1}}>
              <Box sx={{mb:2}}>
                <Typography gutterBottom variant='h6' component='h6'>Detail</Typography>
                <Box my={1} display='flex' flexDirection='row' alignItems='center'><Typography>{t("Transaction.type")}</Typography><Label sx={{ml:2}} variant='filled' color='default'>{data.type.toUpperCase()}</Label></Box>
                <Box my={1} display='flex' flexDirection='row' alignItems='center'><Typography>{t("Payment.payment_method")}</Typography><Label sx={{ml:2}} variant='filled' color='info'>{data.payment}</Label></Box>
                <Box my={1} display='flex' flexDirection='row' alignItems='center'><Typography>{t("Transaction.payment_status")}</Typography><Label sx={{ml:2}} variant='filled' color={colorStatus[data.status]}>{data.status}</Label></Box>
                <Box my={1} display='flex' flexDirection='row' alignItems='center'><Typography>{t("Transaction.order_status")}</Typography><Label sx={{ml:2}} variant='filled' color={colorOrderStatus[data.order_status]}>{data.order_status}</Label></Box>
              </Box>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center' colSpan={5}>{t("Menu.products")}</TableCell>
                    <TableCell rowSpan={2} align='right'>Subtotal</TableCell>
                    <TableCell rowSpan={2} align='right'>{t("Product.disscount")}</TableCell>
                    <TableCell rowSpan={2} align='right'>Total</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t("General._name")}</TableCell>
                    <TableCell align='right'>{t("Product.price")}</TableCell>
                    <TableCell align='right'>{t("Product.disscount")}</TableCell>
                    <TableCell align='right'>Qty</TableCell>
                    <TableCell align='right'>HPP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((d)=>{
                    const subtotal = d.price*d.qty;
                    const disscount = d.disscount*d.qty;
                    const total = subtotal-disscount;
                    return (
                      <TableRow key={`items-${data.id}-${d.id}`}>
                        <TableCell>{`${d.name}`}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${d.price}`)}`}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${d.disscount}`)}`}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{d.qty}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{d.hpp ? `IDR ${numberFormat(`${d.hpp}`)}` : '-'}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${subtotal}`)}`}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${disscount}`)}`}</TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${total}`)}`}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default function OutletTransactions({meta}: IPages){
  const t = useTranslations();
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const {page,rowsPerPage,...pagination} = usePagination();
  const [query,setQuery]=React.useState<{filter:string,from:null|number,to:null|number}>({filter:'monthly',from:null,to:null})
  const [range,setRange]=React.useState({from:getDayJs().subtract(1, 'month'),to:getDayJs()})
  const [dFilter,setDFilter] = React.useState(false);
  const [dRange,setDRange] = React.useState(false);
  const [searchVal,setSearchVal] = React.useState('');
  const [search,setSearch] = React.useState<TransactionsDetail[]|undefined>(undefined);
  const is543 = useMediaQuery('(min-width:543px)')
  const {data,error} = useSWR<ResponsePagination<TransactionsDetail>>(`/toko/${toko_id}/${outlet_id}/transactions?page=${page}&per_page=${rowsPerPage}&filter=${query?.filter}${query?.filter === 'custom' ? `&from=${query?.from}&to=${query?.to}` : ''}`)

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

  const handleChange=React.useCallback((filter:'monthly'|'weekly'|'daily'|'custom')=>()=>{
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Header title={`${t("Menu.transactions")} - ${meta?.title}`} desc={meta?.description}>
        <Dashboard title={meta?.title} subtitle={meta?.toko_name}>
          <Container>
            <Box pb={2} mb={5}>
              <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                <Typography variant="h3" component='h3'>{t("Menu.transactions")}</Typography>
                <Button startIcon={<Iconify icon='akar-icons:filter' />} text color='inherit' ref={filterRef} onClick={()=>setDFilter(true)}>Filter</Button>
              </Stack>
              <MenuPopover open={dFilter} onClose={()=>setDFilter(false)} anchorEl={filterRef.current} paperSx={{py:1,width:250}}>
                <MenuItem sx={{ color: 'text.secondary',py:1 }} onClick={handleChange('monthly')} selected={query.filter==='monthly'}>
                  <ListItemText primary={t("Transaction.month")} />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleChange('weekly')} selected={query.filter==='weekly'}>
                  <ListItemText primary={t("Transaction.week")} />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }}  onClick={handleChange('daily')} selected={query.filter==='daily'}>
                  <ListItemText primary={t("Transaction.today")} />
                </MenuItem>
                <MenuItem sx={{ color: 'text.secondary',py:1 }} ref={rangeRef} onClick={()=>setDRange(true)} selected={query.filter==='custom'}>
                  <ListItemText primary={t("Transaction.custom")} />
                </MenuItem>
              </MenuPopover>
              <MenuPopover open={dRange} onClose={()=>setDRange(false)} anchorEl={rangeRef.current} paperSx={{py:2,px:2,width:{xs:'90%',sm:200,md:300,lg:400}}}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <DatePicker
                      disableFuture
                      label={t("Transaction.from")}
                      inputFormat="DD MMMM YYYY"
                      value={range.from}
                      onChange={handleDateChange('from')}
                      renderInput={params=><TextField fullWidth {...params} />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                      disableFuture
                      label={t("Transaction.to")}
                      inputFormat="DD MMMM YYYY"
                      value={range.to}
                      onChange={handleDateChange('to')}
                      renderInput={params=><TextField fullWidth {...params} />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button onClick={handleChange('custom')}>{t("General.save")}</Button>
                  </Grid>
                </Grid>
              </MenuPopover>
            </Box>
            <Card>
              <Box sx={{p:2}}>
                <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
                  <Search autosize={is543} remove value={searchVal} onchange={handleSearch} onremove={handleSearchRemove} />
                  <Button icon='download'>Download</Button>
                </Stack>
              </Box>
              <Scrollbar>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align='left'></TableCell>
                      <TableCell align='left'>ID</TableCell>
                      <TableCell align='left'>{t("General.date")}</TableCell>
                      <TableCell align='right'>Subtotal</TableCell>
                      <TableCell align='right'>{t("Product.disscount")}</TableCell>
                      <TableCell align='right'>Total</TableCell>
                      <TableCell align='center'></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {error ? (
                      <TableRow>
                        <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{error?.message}</Typography></TableCell>
                      </TableRow>
                    ) : !data && !error || !items ? (
                      <TableRow>
                        <TableCell align="center" colSpan={7} sx={{ py: 3 }}><CircularProgress size={30} /></TableCell>
                      </TableRow>
                    ) : items?.length === 0 ? (
                      <TableRow>
                        <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{t("General.no",{what:t("Menu.transactions")})}</Typography></TableCell>
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