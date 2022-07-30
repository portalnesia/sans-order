import {useCallback,useMemo,useState,useContext,FormEvent, ChangeEvent,useEffect, Fragment, useRef} from 'react'
import {Box,Typography,Stack,IconButton,Slide,Fade,Collapse,ListItem,List,ListItemText,ListItemSecondaryAction, Divider,Grid, TextField,Autocomplete, CircularProgress, Paper, ListItemButton } from '@mui/material'
import {Close,ArrowBackIosRounded,ExpandMore as ExpandMoreIcon} from '@mui/icons-material'
import Button from './Button';
import { useTranslation } from 'next-i18next';
import { BANK_CODES, CopyRequired, EWALLET_CODE, EWalletResults, PAYMENT_TYPE, QrCodeResults, VirtualAccResults,sendBankCode,walletChannelCodetoEwalletCode,Transaction,paymentCodeName, PAYMENT_STATUS } from '@type/index';
import { Context, ICard } from '@redux/cart';
import { useSelector,State } from '@redux/index';
import ExpandMore from './ExpandMore';
import Image from '@comp/Image'
import dynamic from 'next/dynamic'
import { useAPI } from '@utils/api';
import { useRouter } from 'next/router';
import { DialogProps } from './Dialog';
import useOutlet from '@utils/useOutlet';
import { Circular } from './Loading';
import { numberFormat } from '@portalnesia/utils';
import useSWR from '@utils/swr';
import Backdrop from './Backdrop';
import { getDayJs } from '@utils/Main';
import useNotification from '@utils/notification';
import qrOptions from '@utils/defaultQr';
import {QrisIcon,BankIcon,EWalletIcon,DanaIcon,ShopeePayIcon,LinkAjaIcon,RedirectIcon,} from '@comp/payment-icon/index'
import { isMobile } from 'react-device-detect';
import useSocket from '@utils/Socket';
import Lottie from './Lottie';
import {logEvent,getAnalytics} from '@utils/firebase'

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Table=dynamic(()=>import('@mui/material/Table'));
const TableBody=dynamic(()=>import('@mui/material/TableBody'))
const TableRow=dynamic(()=>import('@mui/material/TableRow'))
const TableCell=dynamic(()=>import('@mui/material/TableCell'))

export interface PaymentProps {
  open: DialogProps['open']
  handleClose: DialogProps['handleClose'],
  table_number?: string
}

function Cart({cart,total,subtotal,discount}: {cart:ICard[],total:number,subtotal:number,discount:number}) {
  const {t} = useTranslation('catalogue');
  const [expand,setExpand] = useState(false);
  return (
    <>
      <Button onClick={()=>setExpand(!expand)} sx={{width:'100%',borderRadius:0,px:2,py:1}} text color='inherit'>
        <Typography>{`${t("order_summary")} (${cart.length} items)`}</Typography>
        <ExpandMore disabled={!expand} onClick={()=>setExpand(!expand)} expand={expand}>
          <ExpandMoreIcon />
        </ExpandMore>
      </Button>
      <Collapse unmountOnExit in={expand}>
        <Divider />
        <List>
          {cart.map((c,i)=>(
            <ListItemButton>
              <ListItemText primary={c.item.name} secondary={
                <>
                  <Typography variant='body2'>{`${c.qty} x Rp${numberFormat(`${c.price - c.discount}`)}`}</Typography>
                  {c.discount > 0 && <Typography variant='caption'>{`disc. Rp${numberFormat(`${(c.discount)}`)}`}</Typography>}
                  {c?.notes && <Typography variant='caption'>{`${t('notes')}: ${c?.notes}`}</Typography>}
                </>
              } />
              <ListItemSecondaryAction>
                <Typography sx={{mt:3}} variant='body2'>{`Rp${numberFormat(`${(c.price*c.qty) -( c.discount*c.qty)}`)}`}</Typography>
                {c.discount > 0 && <Typography variant='body2'>{`(Rp${numberFormat(`${(c.discount*c.qty)}`)})`}</Typography>}
              </ListItemSecondaryAction>
            </ListItemButton>
          ))}
          <Divider sx={{my:2}} />
          <ListItem disablePadding sx={{px:2}}>
            <ListItemText primary="Subtotal" />
            <ListItemSecondaryAction>
              <Typography variant='body2'>{`Rp${numberFormat(`${subtotal}`)}`}</Typography>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disablePadding sx={{px:2}}>
            <ListItemText primary={t("discount")} />
            <ListItemSecondaryAction>
              <Typography variant='body2'>{`Rp${numberFormat(`${discount}`)}`}</Typography>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disablePadding sx={{px:2}}>
            <ListItemText primary="Total" />
            <ListItemSecondaryAction>
              <Typography variant='body2'>{`Rp${numberFormat(`${total}`)}`}</Typography>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <Divider sx={{my:2}} />
      </Collapse>
    </>
  )
}

type ITelephone = {
  label: string,
  code: string
}

type IForm = {
  input:{
    name?: string,
    email?: string,
    tel: ITelephone,
    telephone?: string,
    payment: {
      type: PAYMENT_TYPE|null,
      bank?: BANK_CODES,
      ewallet?: EWALLET_CODE
    },
    metadata?: {
      table_number?: string
    }
  },
  user: State['user'],
  setInput(data: IForm['input']): void,
  loading: string|null,
  table_number?: string
}

const defaultInput: Pick<CopyRequired<IForm['input'],'payment'|'tel'>,'tel'|'payment'> = {
  payment:{
    type:null
  },
  tel:{
    label:"Indonesia (+62)",
    code:"+62"
  }
}

function Form({input,user,setInput,loading,table_number}: IForm) {
  const {t} = useTranslation('catalogue');
  const {t:tCom} = useTranslation('common');
  const {get} = useAPI();
  const router = useRouter();
  const {outlet_id} = router.query;
  const [openList,setOpenList]=useState(false)
  const [option,setOption]=useState<ITelephone[]>([]);
  const [loadingList,setLoadingList]=useState(false);
  const {outlet} = useOutlet(outlet_id,{revalidateOnMount:true});

  const handleChange=useCallback((name: 'name'|'email'|'telephone'|'type'|'bank'|'ewallet'|'table_number')=>(e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
    const newInput = {
      ...input,
      ...(['type','bank','ewallet'].includes(name) ? {
        payment:{
          ...input.payment,
          [name]:e.target.value
        }
      } : name === 'table_number' ? {
        metadata:{
          ...input.metadata,
          table_number:e.target.value
        }
      } : {
        [name]:e.target.value
      })
    }
    setInput(newInput);
  },[input])

  const telephoneCompleteChange=useCallback((value,newValue: ITelephone)=>{
    if(newValue && newValue.code) {
      setInput({
        ...input,
        tel:newValue,
      })
    }
},[input])

  useEffect(()=>{
    if(option.length === 0 && !user) {
      get<{data:ITelephone[]}>(`/list-telephone`)
      .then((res)=>{
        setLoadingList(false)
        const list = res.data.data;
        setOption(list);
      }).catch((err)=>{
        setLoadingList(false)
      })
    }
  },[openList,option,user,get])

  return (
    <Box sx={{p:2}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {table_number ? (
            <Typography>{`${tCom("table_number")}: ${table_number}`}</Typography>
          ) : (
            <TextField
              fullWidth
              label={tCom("table_number")}
              value={input.metadata?.table_number||''}
              onChange={handleChange('table_number')}
              required={!!outlet?.data.table_number}
              placeholder='A1'
            />
          )}
        </Grid>
        {!user ? (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("name")}
                value={input.name||''}
                onChange={handleChange('name')}
                required
                placeholder='John Doe'
                autoComplete='name'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={'Email'}
                value={input.email||''}
                onChange={handleChange('email')}
                required
                placeholder='example@portalnesia.com'
                autoComplete='email'
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <Autocomplete
                    open={openList}
                    disableClearable
                    value={input.tel||defaultInput.tel}
                    onChange={telephoneCompleteChange}
                    isOptionEqualToValue={(option, value) => option.code == value.code}
                    getOptionLabel={(option) => option.label}
                    options={option}
                    loading={loadingList || option.length===0 && openList}
                    onOpen={() => {
                      setOpenList(true);
                    }}
                    disabled={loading!==null}
                    onClose={() => {
                      setOpenList(false);
                    }}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        disabled={loading!==null}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <Fragment>
                                {loadingList ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label={t("telephone")}
                    value={input.telephone||''}
                    onChange={handleChange('telephone')}
                    placeholder='8123456789'
                    autoComplete='tel'
                  />
                </Grid>
              </Grid>
            </Grid>
          </>  
        ) : null}
      </Grid>
    </Box>
  )
}

type IPaymentMethod = {
  is_enabled: boolean,
  channel_category: PAYMENT_TYPE,
  name: string,
  channel_code: string
}

function MethodItems({dt,payment,onChange,category}: {payment:IForm['input']['payment'],dt:IPaymentMethod[],onChange(payment: IForm['input']['payment']): void,category: PAYMENT_TYPE}) {
  const [expand,setExpand] = useState(false);

  const handleChange=useCallback((d: IPaymentMethod)=>()=>{
    let dt: IForm['input']['payment']|undefined;
    if(['COD','QRIS'].includes(d.channel_category)) {
      dt={
        type:d.channel_category
      }
    } else if(d.channel_category === 'VIRTUAL_ACCOUNT') {
      dt = {
        type:d.channel_category,
        bank:d.channel_code as BANK_CODES
      }
    } else if(d.channel_category === 'EWALLET') {
      dt = {
        type:d.channel_category,
        ewallet:d.channel_code as EWALLET_CODE
      }
    }
    if(dt) onChange(dt);
  },[onChange])

  const icon = useCallback((data: IPaymentMethod)=>{
    if(category === 'QRIS') return <QrisIcon />;
    if(category === 'EWALLET') {
      if(typeof EWalletIcon[data.channel_code as EWALLET_CODE] !== 'undefined') {
        const Element = EWalletIcon[data.channel_code as EWALLET_CODE];
        return <Element />;
      }
    }
    if(category === 'VIRTUAL_ACCOUNT') {
      if(typeof BankIcon[data.channel_code as BANK_CODES] !== 'undefined') {
        const Element = BankIcon[data.channel_code as BANK_CODES];
        return <Element />;
      }
    }
    return <Typography>{data.name}</Typography>;
  },[category])

  const getDisabled=useCallback((d: IPaymentMethod)=>{
    if(payment.type === 'VIRTUAL_ACCOUNT') return payment.bank === d.channel_code;
    else if(payment.type === 'EWALLET') return payment.ewallet === d.channel_code;
    else return payment.type === d.channel_code
  },[payment])

  return (
    <>
      <Button onClick={()=>setExpand(!expand)} sx={{width:'100%',borderRadius:0,px:2,py:1,borderBottom:(theme)=>`1px solid ${theme.palette.divider}`}} text color='inherit'>
        <Typography>{paymentCodeName[category]}</Typography>
        <ExpandMore disabled={!expand} onClick={()=>setExpand(!expand)} expand={expand}>
          <ExpandMoreIcon />
        </ExpandMore>
      </Button>

      <Collapse unmountOnExit in={expand}>
        <Box py={2} px={2}>
          <Grid container spacing={2}>
            {dt.map((d,i)=>(
              <Grid key={d.channel_code} item xs={6} sm={4} md={3}>
                <Button {...(getDisabled(d) ? {} : {outlined:true,color:'inherit'})} onClick={handleChange(d)}>
                  {icon(d)}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </>
  )
}

function Method({payment,onChange}: {payment:IForm['input']['payment'],onChange(payment: IForm['input']['payment']): void}) {
  const router = useRouter();
  const {outlet_id} = router.query;
  const {data,error} = useSWR<IPaymentMethod,true>(`/outlets/${outlet_id}/payments`);

  const dt = useMemo(()=>{
    if(!data) return undefined;
    const filter = data.data.filter(d=>{

      return d.is_enabled && ((process.env.NEXT_PUBLIC_PN_ENV === 'test' && d.channel_category !== 'EWALLET') || process.env.NEXT_PUBLIC_PN_ENV!=='test')
    });
    const dt = filter.reduce((p,n)=>{
      (p[n.channel_category] = p[n.channel_category] || []).push(n);
      return p;
    },{} as Record<string,IPaymentMethod[]>)
    return dt;
  },[data]);

  if((!data || !dt) && !error) return <Box sx={{p:2}}><Circular /></Box>;

  if(dt) return (
    <>
      {Object.keys(dt).map(k=><MethodItems dt={dt[k]} payment={payment} onChange={onChange} category={k as PAYMENT_TYPE} />)}
    </>
  )
  return null;
}

type PaymentResponse<D=any> = CopyRequired<Transaction<D>,'payload'>

function CodInformation({data}: {data: PaymentResponse}) {
  const {t} = useTranslation('catalogue');
  return (
    <Box>
      <Typography variant='h6' component='h6'>{t("instruction.title")}</Typography>
      <List component={'ol'} sx={{listStyle:'decimal',listStylePosition:'inside'}}>
        {t("instruction.cod").split("\n").map((k,i)=>(
          <ListItem key={`cod-${i}`} disablePadding sx={{display:'list-item'}}>{k}</ListItem>
        ))}
      </List>
    </Box>
  )
}

function QrisInformation({data}: {data: PaymentResponse<QrCodeResults>}) {
  const {t} = useTranslation('catalogue');
  const [img,setImg] = useState<string>();

  useEffect(()=>{
    async function getQr() {
      const QrCode = (await import('qr-code-styling')).default;
      const opt = {...qrOptions,data:data.payload?.qr_string}
      const qr = new QrCode(opt);
      const image = await qr.getRawData('png');
      if(image) {
        const url = (window.webkitURL || window.URL).createObjectURL(image);
        setImg(url);
      }
    }
    getQr();

    return ()=>setImg(undefined)
  },[data.payload?.qr_string])

  return (
    <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
      <Typography>{t("instruction.qris.scan")}</Typography>
      <Typography gutterBottom>{t("instruction.qris.accept")}</Typography>
      
      <Grid container spacing={1} justifyContent='center'>
        <Grid key={`chip-1`} item xs="auto" zeroMinWidth>
          <DanaIcon sx={{width:80,height:44}} />
        </Grid>
        <Grid key={`chip-2`} item xs="auto" zeroMinWidth>
          <ShopeePayIcon sx={{width:80,height:44}} />
        </Grid>
        <Grid key={`chip-3`} item xs="auto" zeroMinWidth>
          <LinkAjaIcon sx={{width:80,height:44}} />
        </Grid>
      </Grid>
      <Box sx={{mt:2}}>
        <Typography gutterBottom>{t("instruction.qris.other")}</Typography>
      </Box>
      {img && (
        <Box mt={3} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
          <Image src={img} dataSrc={img} fancybox style={{maxWidth:'80%',height:'auto',marginLeft:'auto',marginRight:'auto'}} />
          <Box mt={3}>
            <Button href={img} download={`QRIS #${data.uid}`}>Download</Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function EwalletInformation({data}: {data: PaymentResponse<EWalletResults>}) {
  const {t} = useTranslation('catalogue');
  const [img,setImg] = useState<string>();

  useEffect(()=>{
    async function getQr() {
      if(data?.payload?.actions?.qr_checkout_string) {
        const QrCode = (await import('qr-code-styling')).default;
        const opt = {...qrOptions,data:data.payload.actions?.qr_checkout_string}
        const qr = new QrCode(opt);
        const image = await qr.getRawData('png');
        if(image) {
          const url = (window.webkitURL || window.URL).createObjectURL(image);
          setImg(url);
        }
      }
    }
    getQr();
    return ()=>setImg(undefined)
  },[data])

  const redirectName = useMemo(()=>{
    if(typeof walletChannelCodetoEwalletCode[data?.payload?.channel_code||""] !== 'undefined') {
      return t("instruction.ewallet.redirect",{what:walletChannelCodetoEwalletCode[data?.payload?.channel_code||""]})
    }
    return t("instruction.ewallet.redirect",{what:data?.payload?.channel_code})
  },[data,t])

  return (
    <Box>
      {data?.payload?.channel_code === 'ID_SHOPEEPAY' ? (
        <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
          <Typography>{t("instruction.qris.scan")}</Typography>
          {img && (
            <Box mt={3}  display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
              <a href={isMobile ? data?.payload?.actions?.mobile_deeplink_checkout_url||'#' : '#'}>
                <Image src={img} dataSrc={img} fancybox={!isMobile} style={{maxWidth:'80%',height:'auto',marginLeft:'auto',marginRight:'auto'}} />
              </a>
              <Box mt={3}>
                <Button href={img} download={`ShopeePay #${data.uid}`}>Download</Button>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
          <RedirectIcon />
          <Box mt={2}><Typography>{redirectName}</Typography></Box>
        </Box>
      )}
    </Box>
  )
}

function VaInformation({data}: {data: PaymentResponse<VirtualAccResults>}) {
  const {t} = useTranslation('catalogue');

  const icon = useMemo(()=>{
    if(typeof BankIcon[data?.payload?.bank_code as BANK_CODES] !== 'undefined') {
      const Element = BankIcon[data?.payload.bank_code as BANK_CODES];
      return <Element sx={{width:230,height:100}} />;
    }
    else if(typeof sendBankCode[data.payload.bank_code as BANK_CODES] !== 'undefined') {
      return <Typography>{sendBankCode[data.payload.bank_code as BANK_CODES]}</Typography>;
    }
    return null
  },[data.payload.bank_code])
  return (
    <Box>
      <Grid container spacing={2} alignItems='center' justifyContent={'center'}>
        <Grid item xs={12} sm={6}>
          {icon}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant='caption'>Virtual Account</Typography>
          <Typography variant='h6' component={'h6'} paragraph>{data.payload.account_number}</Typography>
          <Typography variant='caption'>Virtual Account Name</Typography>
          <Typography variant='h6' component={'h6'} paragraph>{data.payload.name}</Typography>
        </Grid>
      </Grid>
      <Box mt={2}>
        
      </Box>
    </Box>
  )
}

export default function PaymentMethod({open,handleClose,table_number}: PaymentProps) {
  const user = useSelector<State['user']>(s=>s.user);
  const socket = useSocket();
  const router = useRouter();
  const {outlet_id} = router.query;
  const {t} = useTranslation('catalogue');
  const {t: tCom} = useTranslation('common');
  const {t: tMenu} = useTranslation('menu');
  const {post} = useAPI();
  const setNotif = useNotification();
  const [loading,setLoading] = useState<string|null>(null);
  const [input,setInput] = useState<IForm['input']>(defaultInput);
  const {outlet,errOutlet} = useOutlet(outlet_id,{revalidateOnMount:true});
  const [menu,setMenu] = useState<PaymentResponse|null>(null);
  const [dSuccess,setDSuccess] = useState<Transaction|null>(null);

  let timeout = useRef<NodeJS.Timeout|undefined>();

  const context = useContext(Context);
  const {cart,removeCart} = context;
  const {total,subtotal,discount} = useMemo(()=>{
    const {price,discount} = cart.reduce((p,n)=>{
      const price = n.price * n.qty;
      const discount = n.discount * n.qty;
      p.price = p.price + price;
      p.discount = p.discount + discount;
      return p;
    },{price:0,discount:0})

    const total = price - discount
    return {total,subtotal:price,discount};
  },[cart])

  const onClose = useCallback(()=>{
    if(loading!=='submit' && handleClose) handleClose();
  },[loading,handleClose])

  const handleChangePayment = useCallback((payment: IForm['input']['payment'])=>{
    setInput({...input,payment})
  },[input])

  const handleSubmit = useCallback(async(e?: FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e?.preventDefault();
    const paymentType = Object.keys(PAYMENT_TYPE);
    if(!input.payment.type || !paymentType.includes(input.payment.type)) return setNotif(t("error.method"),true);
    setLoading('submit')
    try {
      const name = (!user ? input.name : user?.name) as string;
      const email = (!user ? input.email : user?.email) as string;
      const telephone = input.telephone && input.telephone.length > 0 ? `${input.tel.code}${input.telephone}` : undefined;
      const dt = {
        type:'self_order',
        cash:total,
        items:cart.map(c=>({item:c.item.id,qty:c.qty,notes:c.notes})),
        ...(!user ? {name,email,telephone} : {}),
        payment:input.payment,
        metadata:input.metadata
      }
      const response = await post<Transaction>(`/transactions/outlet/${outlet_id}`,{...dt});
      const analytics = getAnalytics();

      // @ts-ignore
      logEvent(analytics,'purchase',{
        currency:"IDR",
        value:total,
        transaction_id: response.data.uid,
        items: cart.map(i=>({
          item_id: `${i.item.id}`,
          item_name: i.item.name,
          discount: i.discount,
          price: i.price,
          quantity: i.qty
        }))
      })

      removeCart();

      const r = response.data as PaymentResponse;
      
      if(r.payment === 'EWALLET') {
        const re = r as PaymentResponse<EWalletResults>;
        let url: string|undefined;
        if(re.payload.is_redirect_required || (typeof re.payload.actions?.mobile_deeplink_checkout_url === 'string' || typeof re.payload.actions?.mobile_web_checkout_url === 'string' || typeof re.payload.actions?.desktop_web_checkout_url === 'string')) {
          if(!isMobile && re.payload.actions?.desktop_web_checkout_url) url = re.payload.actions.desktop_web_checkout_url;
          else if(isMobile && (typeof re.payload.actions?.mobile_deeplink_checkout_url === 'string' || typeof re.payload.actions?.mobile_web_checkout_url === 'string')) url = (re.payload.actions?.mobile_deeplink_checkout_url||re.payload.actions?.mobile_web_checkout_url) as string;
        }
        if(typeof url === 'string') {
          setTimeout(()=>{
            if(typeof url === 'string') window.location.href=url;
          },2000)
        }
      }
      setMenu(r);
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[post,outlet_id,removeCart,input,cart,total,user,setNotif,tCom])

  const handleSimulation = useCallback(async()=>{
    if(process.env.NEXT_PUBLIC_PN_ENV !== 'test') return;
    if(!menu) return;

    setLoading('simulation')
    try {
      await post(`/transactions/outlet/${outlet_id}/simulation/${menu.id}`);

    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }

  },[menu,post,outlet_id])

  const handleCloseDSuccess=useCallback(()=>{
    if(timeout.current) {
      clearTimeout(timeout.current);
      timeout.current=undefined;
    }
    setDSuccess(null)
  },[])

  useEffect(()=>{
    if(!open) {
      setInput(defaultInput)
      setMenu(null);
      setLoading(null);
    }
  },[open])

  useEffect(()=>{
    async function handleOnTransactions(dt: Transaction) {
      console.log(menu)
      if(menu && menu.id === dt.id && dt.status === PAYMENT_STATUS.PAID) {
        setDSuccess(dt);
        onClose();
        timeout.current = setTimeout(()=>{
          router.push(`/transactions/${dt.uid}`);
        },10000)
      }
    }
    socket?.on('toko transactions',handleOnTransactions);

    return ()=>{
      socket?.off('toko transactions',handleOnTransactions)
    }
  },[socket,menu,onClose])
  
  return (
    <>
      <Dialog open={open} handleClose={onClose} loading={loading==='submit'}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            <Stack direction='row' justifyContent={'space-between'} alignItems='center' spacing={2}>
              <Stack spacing={2} direction='row' alignItems={'center'}>
                <Fade in={false} unmountOnExit>
                  <IconButton><ArrowBackIosRounded /></IconButton>
                </Fade>
                <Typography variant='h6'>{t("payment_method")}</Typography>
              </Stack>
              <IconButton onClick={onClose}><Close /></IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers sx={{p:0,position:'relative',overflow:'hidden'}}>
            {menu===null && (
              <Box>
                <Cart cart={cart} total={total} subtotal={subtotal} discount={discount} />
                {!outlet && !errOutlet ? (
                  <Box sx={{p:2}}><Circular /></Box>
                ) : errOutlet ? (
                  <Box sx={{p:2}}><Typography>{errOutlet.error.message}</Typography></Box>
                ) : (
                  <>
                    <Form input={input} setInput={setInput} user={user} loading={loading} table_number={table_number} />
                    <Method payment={input.payment} onChange={handleChangePayment} />
                  </>
                )}
              </Box>
            )}
            {menu!==null && (
              <>
                <Box py={2}>
                  <Box>
                    <Table>
                      <TableBody>
                        <TableRow sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${t("id",{what:tMenu("transactions")})}`}</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${menu.uid}`}</TableCell>
                        </TableRow>
                        <TableRow sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${t("payment_method")}`}</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${menu.payment === 'VIRTUAL_ACCOUNT' ? "BANK TRANSFER" : menu.payment}`}</TableCell>
                        </TableRow>
                        <TableRow sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{t("name")}</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{menu?.user?.name||"No Name"}</TableCell>
                        </TableRow>
                        <TableRow sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>Email</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{menu?.user.email||"No Email"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
                <Divider />
                <Box p={2} textAlign='center'>
                  <Typography>{(`${t("pay_before")} `).toUpperCase()}</Typography>
                  <Typography gutterBottom variant='h6' component='h6'>{(getDayJs(menu.expired).pn_format('full')).toUpperCase()}</Typography>
                  <Typography variant='h3' component='h3'>{`Rp${numberFormat(`${menu.total}`)}`}</Typography>
                </Box>
                <Divider />
                <Box p={2}>
                  {menu?.payment === 'COD' ? (
                    <CodInformation data={menu} />
                  ) : menu?.payment === 'EWALLET' ? (
                    <EwalletInformation data={menu} />
                  ) : menu?.payment === 'VIRTUAL_ACCOUNT' ? (
                    <VaInformation data={menu} />
                  ) : menu?.payment === 'QRIS' ? (
                    <QrisInformation data={menu} />
                  ) : null}
                </Box>
              </>
            )}
          </DialogContent>
          {menu===null && (
            <DialogActions>
              <Button type='submit' disabled={loading!==null} loading={loading==='submit'} icon='submit'>{t("pay")}</Button>
            </DialogActions>
          )}
          {(menu !== null && process.env.NEXT_PUBLIC_PN_ENV==='test' && menu.payment !== PAYMENT_TYPE.COD) && (
            <DialogActions>
              <Button onClick={handleSimulation} disabled={loading!==null} loading={loading==='simulation'} icon='submit'>Simulate</Button>
            </DialogActions>
          )}
        </form>
      </Dialog>
      <Dialog open={dSuccess!==null} handleClose={handleCloseDSuccess}>
        <DialogContent>
          <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie animation='payment-success' sx={{width:250}} /></Box>
          <Box mt={2} textAlign='center'>
            <Typography variant='h5' component='h5'>{t("success.title")}</Typography>
            <Typography>{t("success.description")}</Typography>
          </Box>
          <Divider sx={{my:2}} />
          <Box>
            <Table>
              <TableBody>
                <TableRow sx={{borderBottom:'unset'}}>
                  <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${t("id",{what:tMenu("transactions")})}`}</TableCell>
                  <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${dSuccess?.uid}`}</TableCell>
                </TableRow>
                <TableRow sx={{borderBottom:'unset'}}>
                  <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${t("payment_method")}`}</TableCell>
                  <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${dSuccess?.payment === 'VIRTUAL_ACCOUNT' ? "BANK TRANSFER" : dSuccess?.payment}`}</TableCell>
                </TableRow>
                <TableRow sx={{borderBottom:'unset'}}>
                  <TableCell sx={{borderBottom:'unset',py:0.5}}>{t("name")}</TableCell>
                  <TableCell sx={{borderBottom:'unset',py:0.5}}>{dSuccess?.user?.name}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          <Box mt={4}>
            <Typography variant='caption'>{t("success.redirect")}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button text color='inherit' onClick={handleCloseDSuccess}>{tCom('close')}</Button>
        </DialogActions>
      </Dialog>
      <Backdrop open={loading==='submit'} />
    </>
  )
}