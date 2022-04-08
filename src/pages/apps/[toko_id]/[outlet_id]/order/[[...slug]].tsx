// material
import { Box, Grid, Container, Typography, IconButton,TextField,Tabs,Tab,Table,TableHead,TableRow,TableBody,TableCell,TablePagination,CircularProgress,Stack,TableFooter,Card } from '@mui/material';
import {Close,Add,Remove} from '@mui/icons-material'
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
import {IOutlet,IPages,ResponsePagination,IProduct, IItems} from '@type/index'
import {wrapper,useSelector,State} from '@redux/index'
import {useTranslations} from 'next-intl';
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
import { numberFormat } from '@portalnesia/utils';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper(async({checkOutlet,params,redirect})=>{
  const slug = params?.slug;
  if(typeof slug?.[0] === 'string' && !['cashier','self-order'].includes(slug?.[0])) {
    return redirect();
  }
  return await checkOutlet({onlyMyToko:true});
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
  id?: string
}

function handlePrint(toko_id: string,outlet_id: string,token: string) {
  return window.open(`${process.env.API_URL}/toko/${toko_id}/${outlet_id}/print/${token}`)
}

function DialogPay({items,total,open,onClose,captchaRef,id,onSuccess}: PayProps) {
  const t = useTranslations();
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const [loading,setLoading] = React.useState(false);
  const [cash,setCash] = React.useState(0);
  const {post} = useAPI();
  const setNotif = useNotif();

  const handleClose=React.useCallback(()=>{
    onClose();
    setCash(0);
  },[onClose])

  const handlePay=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    if(cash < total) return setNotif(t("General.error"),true);
    setLoading(true)
    const url = id ? `/toko/${toko_id}/${outlet_id}/transactions/${id}/pay` : `/toko/${toko_id}/${outlet_id}/transactions`;
    try {
      const recaptcha = await captchaRef.current?.execute();
      const input = {
        cash,
        ...(items ? {type:'cashier',items: items.map(s=>({id:s.id,qty:s.qty}))} : {}),
        recaptcha
      }
      const d = await post<{token: string}>(url,input);
      setLoading(false);
      if(onSuccess) onSuccess(d);
      handleClose();
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(false);
    }
  },[post,cash,items,total,t,captchaRef,toko_id,outlet_id,id,handleClose])

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
        <DialogTitle>{t("Payment.payment")}</DialogTitle>
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
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button text color='inherit' disabled={loading} onClick={handleClose}>{t("General.cancel")}</Button>
          <Button type='submit' icon='submit' disabled={loading||(cash<total)} loading={loading}>Submit</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

function OutletCashier({captchaRef}: {captchaRef: React.RefObject<Recaptcha>}) {
  const t = useTranslations();
  const router = useRouter();
  const user = useSelector<State['user']>(t=>t.user);
  const [dPay,setDPay] = React.useState(false);
  const locale = router.locale||'en';
  const [dialog,setDialog] = React.useState(false)
  const {toko_id,outlet_id} = router.query;
  const [date,setDate] = React.useState(DATE.locale(locale).pn_format('fulldate'));
  const [time,setTime] = React.useState(DATE.format("HH:mm:ss"));
  const {data,error} = useSWR<IIProduct[]>(`/toko/${toko_id}/${outlet_id}/items/cashier?page=1&per_page=100`);
  const [items,setItems] = React.useState<IIProduct[]>([]);
  const [search,setSearch] = React.useState<IIProduct[]|null>(null);
  const [searchVal,setSearchVal] = React.useState("");

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
      const disscount = n.disscount * n.qty;
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
    const it = items.filter(f=>f.name.toLowerCase().indexOf(s.toLowerCase()) > -1);
    if(it.length > 0) setSearch(it);
    else setSearch(null);
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
            <Typography variant="h3" component='h3'>{t("Menu.cashier")}</Typography>
            <Button tooltip='Shift + P' icon='submit' onClick={()=>setDPay(true)} disabled={selected.length === 0}>{t("Cashier.process")}</Button>
          </Stack>
        </Box>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant='h3'>{time}</Typography>
              <Typography>{date}</Typography>
              <Typography>{`${t("Menu.cashier")}: ${user ? user.name : ''}`}</Typography>
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
              <Typography variant='h4' component='h4'>{t("Menu.products")}</Typography>
              <Button tooltip='+' size='small' disabled={Boolean((!data&&!error)||error)} loading={!data&&!error} color='info' onClick={()=>setDialog(true)} icon='add'>{t("General._add")}</Button>
            </Box>
            <Scrollbar>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='left'>{t("General._name")}</TableCell>
                    <TableCell align='left' width={100}>Qty</TableCell>
                    <TableCell align='right'>{t("Product.price")}</TableCell>
                    <TableCell align='right'>{t("Product.disscount")}</TableCell>
                    <TableCell align='right'>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selected.length === 0 ? (
                    <TableRow>
                      <TableCell align='center' colSpan={5} sx={{ py: 3 }}>{t("General.no",{what:t("Menu.products")})}</TableCell>
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
                      <TableCell sx={{whiteSpace:'nowrap'}} align='right'>{`IDR ${numberFormat(`${(d.price*d.qty) - (d.disscount*d.qty)}`)}`}</TableCell>
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
                      <TableCell align='right' colSpan={4}><Typography>{t("Product.disscount")}</Typography></TableCell>
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
            <Typography variant='h4' component='h4'>{t("Menu.products")}</Typography>
            <IconButton onClick={closeDialog}>
              <Close />
            </IconButton>
          </Box>
          <Box>
            <Search autosize remove value={searchVal} onchange={handleSearch} onremove={handleSearchRemove} />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Scrollbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='left'>{t("General._name")}</TableCell>
                  <TableCell align='left' width={100}>Qty</TableCell>
                  <TableCell align='right'>{t("Product.price")}</TableCell>
                  <TableCell align='right'>{t("Product.disscount")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productItems?.length === 0 ? (
                  <TableRow>
                    <TableCell align='center' colSpan={4} sx={{ py: 3 }}>{t("General.no",{what:t("Menu.products")})}</TableCell>
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

export default function OutletCashierGeneral({meta}: IPages) {
  const t = useTranslations();
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
            
        </Container>
      </Dashboard>
      <Recaptcha ref={captchaRef} />
    </Header>
  )
}