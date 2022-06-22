// material
import { Box, Grid, Container, Typography, IconButton,TextField,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,TableFooter,Card, MenuItem, ListItemIcon, ListItemText, Collapse} from '@mui/material';
import {Close,Add,Remove,ExpandMore as ExpandMoreIcon} from '@mui/icons-material'
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
import {IOutlet,IPages,ResponsePagination,IProduct, IItems, TransactionsDetail, colorStatus, colorOrderStatus,orderStatusType} from '@type/index'
import useMediaQuery from '@mui/material/useMediaQuery'
import {wrapper,useSelector,State} from '@redux/index'
import {useTranslation} from 'next-i18next';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import MenuPopover from '@comp/MenuPopover'
import useOutlet from '@utils/useOutlet'
import Scrollbar from '@comp/Scrollbar'
import Search from '@comp/Search'
import {getDayJs} from '@utils/Main'
import {useMousetrap} from '@utils/useKeys'
import dynamic from 'next/dynamic'
import usePagination from '@comp/TablePagination'
import { numberFormat, ucwords } from '@portalnesia/utils';
import handlePrint from '@utils/print';
import ExpandMore from '@comp/ExpandMore';
import Label from '@comp/Label';
import { KeyedMutator } from 'swr';
import useSocket from '@utils/Socket';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper(async({checkOutlet,params,redirect})=>{
  const slug = params?.slug;
  if(typeof slug?.[0] === 'string' && !['cashier','self-order'].includes(slug?.[0])) {
    return redirect();
  }
  return await checkOutlet({onlyMyToko:true,onlyAccess:['transactions']},'dash_order');
})

type IIProduct = IProduct & ({qty: number});

const DATE = getDayJs();

interface PayProps {
  items?: Pick<IItems,'id'|'qty'>[],
  total:number,
  open: boolean,
  onClose(): void,
  onSuccess?(data?: any): void,
  captchaRef: React.RefObject<Recaptcha>,
  /**
   * Transaction ID, pay by cashier (COD)
   */
  id?: string,
  table_number?: string
}

function DateTime() {
  const {t} = useTranslation('menu');

  const router = useRouter();
  const user = useSelector<State['user']>(t=>t.user);
  const locale = router.locale||'en';
  const [date,setDate] = React.useState(DATE.locale(locale).pn_format('fulldate'));
  const [time,setTime] = React.useState(DATE.format("HH:mm:ss"));

  React.useEffect(()=>{
    let interval = setInterval(()=>{
      const date = getDayJs().locale(locale).pn_format('fulldate')
      const time = getDayJs().format("HH:mm:ss");
      setDate(date);
      setTime(time);
    },1000);

    return ()=>{
      clearInterval(interval);
    }
  },[locale])

  return (
    <>
      <Typography variant='h3'>{time}</Typography>
      <Typography>{date}</Typography>
      <Typography>{`${t("cashier")}: ${user ? user.name : ''}`}</Typography>
    </>
  )
}

function DialogPay({items,total,open,onClose,captchaRef,id,onSuccess,table_number}: PayProps) {
  const {t} = useTranslation('dash_order');
  const {t:tCom} = useTranslation('common');

  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const {outlet} = useOutlet(toko_id,outlet_id);
  const [loading,setLoading] = React.useState(false);
  const [cash,setCash] = React.useState(0);
  const [TN,setTN] = React.useState(table_number)
  const {post} = useAPI();
  const setNotif = useNotif();

  const handleClose=React.useCallback(()=>{
    onClose();
    setCash(0);
  },[onClose])

  const handlePay=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    if(cash < total) return setNotif(tCom("error_500"),true);
    setLoading(true)
    const url = id ? `/toko/${toko_id}/${outlet_id}/transactions/${id}/pay` : `/toko/${toko_id}/${outlet_id}/transactions`;
    try {
      const recaptcha = await captchaRef.current?.execute();
      const input = {
        cash,
        ...(items ? {type:'cashier',items: items.map(s=>({id:s.id,qty:s.qty}))} : {}),
        recaptcha,
        ...(TN && TN.length > 0 ? {metadata:{table_number:TN}} : {})
      }
      const d = await post<{token: string}>(url,input);
      setLoading(false);
      if(onSuccess) onSuccess(d);
      handleClose();
    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(false);
    }
  },[post,cash,items,total,tCom,captchaRef,toko_id,outlet_id,id,handleClose,TN])

  React.useEffect(()=>{
    if(open) {
      setTimeout(()=>{
        const el = document.getElementById('cash-input') as HTMLInputElement;
        el.select();
      },200)
    }
  },[open])

  return (
    <Dialog open={open} handleClose={handleClose}>
      <form onSubmit={handlePay}>
        <DialogTitle>{t("payment")}</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>{`IDR ${numberFormat(`${total}`)}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cash</TableCell>
                <TableCell>
                  <TextField
                    id='cash-input'
                    value={cash}
                    onChange={(e)=>setCash(Number(e.target.value))}
                    required
                    fullWidth
                    disabled={loading}
                    type='number'
                    inputProps={{min:0,style:{padding:'8px 10px'}}}
                    autoFocus
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Changes</TableCell>
                <TableCell>{`IDR ${numberFormat(`${cash-total}`)}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{`${tCom("table_number")}${outlet?.table_number ? '*' : ''}`}</TableCell>
                <TableCell>
                  <TextField
                    value={TN}
                    onChange={(e)=>setTN(e.target.value)}
                    required={outlet?.table_number}
                    fullWidth
                    disabled={loading}
                    inputProps={{style:{padding:'8px 10px'}}}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button text color='inherit' disabled={loading} onClick={handleClose}>{tCom("cancel")}</Button>
          <Button type='submit' icon='submit' disabled={loading||(cash<total)||(outlet?.table_number && (typeof TN !== 'string' || TN?.length === 0))} loading={loading}>Submit</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

function OutletCashier({captchaRef}: {captchaRef: React.RefObject<Recaptcha>}) {
  const {t} = useTranslation('dash_order');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const [dPay,setDPay] = React.useState(false);
  const [dialog,setDialog] = React.useState(false)
  const {toko_id,outlet_id} = router.query;
  const {data,error} = useSWR<IIProduct[]>(`/toko/${toko_id}/${outlet_id}/items/cashier?page=1&per_page=100`);
  const [items,setItems] = React.useState<IIProduct[]>([]);
  const [search,setSearch] = React.useState<IIProduct[]|null>(null);
  const [searchVal,setSearchVal] = React.useState("");
  const isAutosize = useMediaQuery('(min-width:543px)')

  const productItems = React.useMemo(()=>{
    if(search !== null) return search;
    return items
  },[items,search]);
  
  const selected = React.useMemo(()=>items.filter(i=>i.qty > 0),[items]);

  useMousetrap(['+','shift+='],()=>setDialog(true));
  useMousetrap('shift+p',()=>selected.length > 0 && setDPay(true));

  const {total,subtotal,disscount} = React.useMemo(()=>{
    const {price,disscount} = selected.reduce((p,n)=>{
      const price = n.price * n.qty;
      const disscount = (n?.disscount||0) * n.qty;
      p.price = p.price + price;
      p.disscount = p.disscount + disscount;
      return p;
    },{price:0,disscount:0})

    const total = price - disscount
    return {total,subtotal:price,disscount};
  },[selected])

  const closeDialog=React.useCallback(()=>{
    setDialog(false);
    setSearch(null)
    setSearchVal("");
  },[])

  const handleSearch = React.useCallback((e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
    const s = e.target.value;
    setSearchVal(s);
    if(s.length === 0) {
      setSearch(null);
      return;
    }
    const it = items.filter(f=>f.name.toLowerCase().indexOf(s.toLowerCase()) > -1);
    setSearch(it);
  },[items])

  const handleSearchRemove = React.useCallback(()=>{
    setSearchVal("")
    setSearch(null);
  },[])

  const handleQty = React.useCallback((type:'add'|'min'|'text',d: IIProduct)=>(e: any)=>{
    const i = items.findIndex(f=>f.id === d.id);
    if(i > -1) {
      const newData = [...items];
      if(type==='text') {
        newData[i].qty = Number(e?.target?.value);
      } else if(type==='add') {
        const qty = newData[i].qty+1;
        newData[i].qty = qty;
      } else if(type === 'min') {
        const qty = newData[i].qty-1;
        newData[i].qty = qty;
      }
      setItems(newData);
    }
  },[items])

  const onSuccess = React.useCallback((d: any)=>{
    if(data) {
      const newData = data.map(f=>({...f,qty:0}))
      setItems(newData);
    }
    handlePrint(toko_id as string,outlet_id as string,d?.token);
  },[data,toko_id,outlet_id])

  React.useEffect(()=>{
    if(data) {
      const items = data.map(d=>({...d,qty:0}));
      setItems(items);
    }
  },[data])

  return (
    <>
      <Container>
        <Box pb={2} mb={5}>
          <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
            <Typography variant="h3" component='h3'>{tMenu("cashier")}</Typography>
            <Button tooltip='Shift + P' icon='submit' onClick={()=>setDPay(true)} disabled={selected.length === 0}>{t("process")}</Button>
          </Stack>
        </Box>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DateTime />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box position='relative' py={3} px={3} display='flex' justifyContent='flex-end'>
                <Box>
                  <Typography variant='h2'><Typography sx={{verticalAlign:'top'}} component='span'>{`IDR`}</Typography>{`${numberFormat(`${total}`)}`}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box mt={4}>
          <Card sx={{px:2}}>
            <Box className='flex-header' py={2}>
              <Typography variant='h4' component='h4'>{tMenu("products")}</Typography>
              <Button tooltip='+' size='small' disabled={Boolean((!data&&!error)||error)} loading={!data&&!error} color='info' onClick={()=>setDialog(true)} icon='add'>{tCom("add")}</Button>
            </Box>
            <Scrollbar>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='left'>{tCom("name")}</TableCell>
                    <TableCell align='left' width={100}>Qty</TableCell>
                    <TableCell align='right'>{t("price")}</TableCell>
                    <TableCell align='right'>{t("disscount")}</TableCell>
                    <TableCell align='right'>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selected.length === 0 ? (
                    <TableRow>
                      <TableCell align='center' colSpan={5} sx={{ py: 3 }}>{tCom("no_what",{what:tMenu("products")})}</TableCell>
                    </TableRow>
                  ) : selected.map((d,i)=>(
                    <TableRow id={`products-${d.id}`}>
                      <TableCell>{d.name}</TableCell>
                      <TableCell align='center'>
                        <Box>
                          <TextField
                            value={d.qty}
                            onChange={handleQty('text',d)}
                            type='number'
                            inputProps={{min:0,style:{padding:'8px 10px'}}}
                          />
                          <Box className='flex-header'>
                            <IconButton size='small' onClick={handleQty('min',d)} disabled={d.qty <= 0}><Remove /></IconButton>
                            <IconButton size='small' onClick={handleQty('add',d)}><Add /></IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${d.price}`)}`}</TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${d.disscount}`)}`}</TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${(d.price*d.qty) - ((d?.disscount||0)*d.qty)}`)}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {selected.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell align='right' colSpan={4}><Typography>Subtotal</Typography></TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}} align='right'><Typography>{`IDR ${numberFormat(`${subtotal}`)}`}</Typography></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='right' colSpan={4}><Typography>{t("disscount")}</Typography></TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}} align='right'><Typography>{`IDR ${numberFormat(`${disscount}`)}`}</Typography></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='right' colSpan={4}><Typography>Total</Typography></TableCell>
                      <TableCell sx={{whiteSpace:'nowrap'}} align='right'><Typography>{`IDR ${numberFormat(`${total}`)}`}</Typography></TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </Scrollbar>
          </Card>
        </Box>
      </Container>
      <Dialog open={dialog} maxWidth='lg' handleClose={closeDialog}>
        <DialogTitle>
          <Box className='flex-header'>
            <Search autosize={isAutosize} remove value={searchVal} onchange={handleSearch} onremove={handleSearchRemove} />
            <IconButton onClick={closeDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Scrollbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='left'>{tCom("name")}</TableCell>
                  <TableCell align='left' width={100}>Qty</TableCell>
                  <TableCell align='right'>{t("price")}</TableCell>
                  <TableCell align='right'>{t("disscount")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productItems?.length === 0 ? (
                  <TableRow>
                    <TableCell align='center' colSpan={4} sx={{ py: 3 }}>{tCom("no_what",{what:tMenu("products")})}</TableCell>
                  </TableRow>
                ) : productItems?.map((d)=>(
                  <TableRow>
                    <TableCell align='left'>{d?.name}</TableCell>
                    <TableCell align='center'>
                      <Box>
                        <TextField
                          value={d.qty}
                          onChange={handleQty('text',d)}
                          type='number'
                          inputProps={{min:0,style:{padding:'8px 10px'}}}
                        />
                        <Box className='flex-header'>
                          <IconButton size='small' onClick={handleQty('min',d)} disabled={d.qty <= 0}><Remove /></IconButton>
                          <IconButton size='small' onClick={handleQty('add',d)}><Add /></IconButton>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${d.price}`)}`}</TableCell>
                    <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${d.disscount}`)}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </DialogContent>
      </Dialog>

      <DialogPay items={selected} total={total} open={dPay} onClose={()=>setDPay(false)} captchaRef={captchaRef} onSuccess={onSuccess} />
    </>
  )
}

type ITransactaion = TransactionsDetail<{table_number?: string}>
interface IMenu {
  data: ITransactaion
  disabled?: boolean,
  captchaRef: PayProps['captchaRef'],
  mutate: KeyedMutator<ResponsePagination<ITransactaion>>
}

function Menu({data,disabled,captchaRef,mutate}: IMenu) {
  const {t} = useTranslation('dash_order');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const ref=React.useRef(null);
  const {put} = useAPI();
  const setNotif = useNotif();
  const [open,setOpen] = React.useState(false);
  const [pay,setPay] = React.useState(false);
  const [dialog,setDialog] = React.useState<string|null>(null);
  const [edit,setEdit] = React.useState(false);
  const [loading,setLoading] = React.useState<string|null>(null);
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;

  const onPrint=React.useCallback((token?: string)=>()=>{
    if(token) {
      handlePrint(toko_id as string,outlet_id as string,token);
    }
    setDialog(null);
    setOpen(false);
  },[toko_id,outlet_id])

  const onPaySuccess=React.useCallback((d: any)=>{
    if(typeof d?.token === 'string') setDialog(d?.token);
  },[]);

  const handleUpdateStatus=React.useCallback(async()=>{
    setLoading('update')
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/toko/${toko_id}/${outlet_id}/transactions/${data.id}`,{status:"FINISHED",recaptcha});
      mutate();
      setNotif(tCom("saved"),false);
      setEdit(false);
    } catch(e: any) {
      setNotif(e?.message||tCom("error"),true);
    } finally {
      setLoading(null);
    }
  },[mutate,put,setNotif,data.id,toko_id,outlet_id,tCom]);

  return (
    <>
      <IconButton disabled={loading!==null||!!disabled} ref={ref} onClick={() => setOpen(true)}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <MenuPopover open={open} onClose={()=>setOpen(false)} anchorEl={ref.current} paperSx={{py:1}}>
        {(data.type==='self_order' && data.payment==='COD' && data.status==='PENDING') && (
          <MenuItem key='menu-1' disabled={loading!==null||!!disabled} sx={{ color: 'text.secondary',py:1 }} onClick={()=>{setPay(true),setOpen(false)}}>
            <ListItemIcon>
              <Iconify icon="fluent:payment-20-filled" width={24} height={24} />
            </ListItemIcon>
            <ListItemText primary={t("pay")} primaryTypographyProps={{ variant: 'body2' }} />
          </MenuItem>
        )}
        {(!['FINISHED','CANCELED'].includes(data.order_status)) && (
          <MenuItem key='menu-1' disabled={loading!==null||!!disabled||data.status!=='PAID'} sx={{ color: 'text.secondary',py:1 }} onClick={()=>{setEdit(true),setOpen(false)}}>
            <ListItemIcon>
              <Iconify icon="icon-park-outline:transaction-order" width={24} height={24} />
            </ListItemIcon>
            <ListItemText primary={tCom("update_ctx",{what:tMenu("transactions")})} primaryTypographyProps={{ variant: 'body2' }} />
          </MenuItem>
        )}
        <MenuItem key='menu-2' disabled={loading!==null||!!disabled} sx={{ color: 'text.secondary',py:1 }} onClick={onPrint(data.token_print)}>
          <ListItemIcon>
            <Iconify icon="fluent:print-20-filled" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary={t("print")} primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </MenuPopover>

      <DialogPay items={data.items} onClose={()=>{setPay(false)}} open={pay} onSuccess={onPaySuccess} captchaRef={captchaRef} total={data.total} id={data.id} table_number={data.metadata?.table_number} />

      <Dialog open={dialog!==null} handleClose={()=>setDialog(null)} loading={loading!==null} fullScreen={false}>
          <DialogTitle>{`${t("print")} E-Receipt?`}</DialogTitle>
          <DialogActions>
            <Button text color='inherit' onClick={()=>setDialog(null)}>{tCom("cancel")}</Button>
            <Button onClick={onPrint(dialog as string)}>{t("print")}</Button>
          </DialogActions>
      </Dialog>

      <Dialog open={edit} handleClose={()=>setEdit(false)} loading={loading!==null} fullScreen={false}>
          <DialogTitle>{tCom("are_you_sure")}</DialogTitle>
          <DialogContent>
            <Typography>{t("update_order_status")}</Typography>
          </DialogContent>
          <DialogActions>
            <Button disabled={loading!==null} text color='inherit' onClick={()=>setEdit(false)}>{tCom("cancel")}</Button>
            <Button disabled={loading!==null} loading={loading==='update'} onClick={handleUpdateStatus}>{tCom("update")}</Button>
          </DialogActions>
      </Dialog>
    </>
  )
}

function TableTr({data,captchaRef,mutate}: {data: ITransactaion,captchaRef: PayProps['captchaRef'],mutate: KeyedMutator<ResponsePagination<ITransactaion>>}) {
  const {t} = useTranslation('dash_order');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
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
        hover
      >
        <TableCell align='center'>
          <ExpandMore expand={expand} onClick={()=>setExpand(!expand)}>
            <ExpandMoreIcon />
          </ExpandMore>
        </TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}}>{data.id}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}}>{`${data.metadata?.table_number||'-'}`}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}}>{date}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='left'>{data.payment}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='center'><Label variant='filled' color={colorOrderStatus[data.order_status]}>{data.order_status}</Label></TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='center'><Label variant='filled' color={colorStatus[data.status]}>{data.status}</Label></TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${data.total}`)}`}</TableCell>
        <TableCell sx={{whiteSpace:'nowrap'}} align='center'><Menu data={data} captchaRef={captchaRef} mutate={mutate} /></TableCell>
      </TableRow>

      <TableRow key={`transactions-details-${data.id}`}>
        <TableCell sx={{borderBottom:'unset',py:0}} colSpan={7}>
          <Collapse in={expand} timeout='auto' unmountOnExit>
            <Box sx={{m:1,mb:8}}>
              <Box sx={{mb:4}}>
                <Typography paragraph variant='h6' component='h6'>Detail</Typography>
                <Table>
                  <TableBody>
                  <TableRow hover>
                      <TableCell sx={{borderBottom:'unset'}}>{tMenu("cashier")}</TableCell>
                      <TableCell sx={{borderBottom:'unset'}}>{data.cashier}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset'}}>{t("type")}</TableCell>
                      <TableCell sx={{borderBottom:'unset'}}><Label variant='filled' color='default'>{data.type.toUpperCase()}</Label></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset'}}>{t("payment_method")}</TableCell>
                      <TableCell sx={{borderBottom:'unset'}}><Label variant='filled' color='info'>{data.payment}</Label></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset'}}>{t("payment_status")}</TableCell>
                      <TableCell sx={{borderBottom:'unset'}}><Label variant='filled' color={colorStatus[data.status]}>{data.status}</Label></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset'}}>{t("order_status")}</TableCell>
                      <TableCell sx={{borderBottom:'unset'}}><Label variant='filled' color={colorOrderStatus[data.order_status]}>{data.order_status}</Label></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}><Typography>{tMenu("customer").toUpperCase()}</Typography></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{borderBottom:'unset'}}>{tCom("name")}</TableCell>
                      <TableCell sx={{borderBottom:'unset'}}>{data.user ? data.user.name : '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
              <Box>
                <Typography variant='h6' component='h6'>{t("detail",{what:tMenu("order")})}</Typography>
              </Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center' colSpan={5}>{tMenu("products")}</TableCell>
                    <TableCell rowSpan={2} align='right'>Subtotal</TableCell>
                    <TableCell rowSpan={2} align='right'>{t("disscount")}</TableCell>
                    <TableCell rowSpan={2} align='right'>Total</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{tCom("name")}</TableCell>
                    <TableCell align='right'>{t("price")}</TableCell>
                    <TableCell align='right'>{t("disscount")}</TableCell>
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
                      <TableRow hover key={`items-${data.id}-${d.id}`}>
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

function OutletSelfOrder({captchaRef}: {captchaRef: PayProps['captchaRef']}) {
  const {t} = useTranslation('dash_order');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const [dPay,setDPay] = React.useState(false);
  const socket = useSocket();
  const {toko_id,outlet_id} = router.query;
  const {page,rowsPerPage,...pagination} = usePagination(true);
  const {data,error,mutate} = useSWR<ResponsePagination<ITransactaion>>(`/toko/${toko_id}/${outlet_id}/transactions/pending?page=${page}&per_page=${rowsPerPage}`);
  const [searchVal,setSearchVal] = React.useState('');
  const [search,setSearch] = React.useState<ITransactaion[]|undefined>(undefined);
  const is543 = useMediaQuery('(min-width:543px)')

  const items = React.useMemo(()=>{
    if(search) return search;
    if(data) return data.data;
    return [];
  },[data,search])

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

  React.useEffect(()=>{
    function onTransactions() {
      mutate();
    }
    socket?.on('toko transactions',onTransactions);
    socket?.on('toko cashier',onTransactions);
    return ()=>{
      socket?.off('toko transactions',onTransactions)
      socket?.off('toko cashier',onTransactions)
    }
  },[socket,mutate])

  return (
    <>
      <Container>
        <Box pb={2} mb={5}>
          <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
            <Typography variant="h3" component='h3'>{tMenu("self_order")}</Typography>
          </Stack>
        </Box>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DateTime />
            </Grid>
          </Grid>
        </Box>
        <Box mt={4}>
          <Card>
            <Box sx={{p:2}}>
              <Stack direction="row" alignItems="center" justifyContent='space-between' spacing={2}>
              <Search autosize remove value={searchVal} onchange={handleSearch} onremove={handleSearchRemove} />
              </Stack>
            </Box>
            <Scrollbar>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'></TableCell>
                    <TableCell align='left'>ID</TableCell>
                    <TableCell align='left'>{ucwords(tCom("table_number"))}</TableCell>
                    <TableCell align='left'>{t("date")}</TableCell>
                    <TableCell align='left'>{t("payment_method")}</TableCell>
                    <TableCell align='center'>{t("order_status")}</TableCell>
                    <TableCell align='center'>{t("payment_status")}</TableCell>
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
                      <TableCell align="center" colSpan={7} sx={{ py: 3 }}><Typography>{tCom("no_what",{what:tMenu("transactions")})}</Typography></TableCell>
                    </TableRow>
                  ) : items?.map((d)=>(
                    <TableTr key={`transaction-${d.id}`} data={d} captchaRef={captchaRef} mutate={mutate} />
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
        </Box>
      </Container>
    </>
  )
}

export default function OutletCashierGeneral({meta}: IPages) {
  const captchaRef = React.useRef<Recaptcha>(null);

  const router = useRouter();
  const {slug,toko_id,outlet_id} = router.query;

  React.useEffect(()=>{
    if(typeof slug?.[0] === 'undefined') {
      router.replace(`/apps/[toko_id]/[outlet_id]/order/cashier`,`/apps/${toko_id}/${outlet_id}/order/cashier`,{shallow:true})
    }
  },[slug,toko_id,outlet_id])

  return (
    <Header title={`${meta?.title}`} desc={meta?.description}>
      <Dashboard title={meta?.title} subtitle={meta?.toko_name}>
        <Container>
            {slug?.[0] === 'cashier' && (
              <OutletCashier captchaRef={captchaRef} />
            )}
            {slug?.[0] === 'self-order' && (
              <OutletSelfOrder captchaRef={captchaRef} />
            )}
        </Container>
      </Dashboard>
      <Recaptcha ref={captchaRef} />
    </Header>
  )
}