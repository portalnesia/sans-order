import {useCallback,useMemo,useState,useContext,FormEvent, ChangeEvent,useEffect, Fragment, useRef} from 'react'
import {Box,Typography,Stack,IconButton,Slide,Fade,Collapse,ListItem,List,ListItemText,ListItemSecondaryAction, Divider,Grid, TextField,Autocomplete, CircularProgress, Paper } from '@mui/material'
import {Close,ArrowBackIosRounded,ExpandMore as ExpandMoreIcon} from '@mui/icons-material'
import Button from './Button';
import { useTranslation } from 'next-i18next';
import { BankCode, CopyRequired, EWalletCode, EWalletResults, IItems, IPayment, paymentCodeName, PaymentResult, paymentType, QrCodeResults, VirtualAccResults,sendBankCode,walletChannelCodetoEwalletCode,ITransaction } from '@type/index';
import { Context } from '@redux/cart';
import { useSelector,State } from '@redux/index';
import ExpandMore from './ExpandMore';
import Image from '@comp/Image'
import dynamic from 'next/dynamic'
import { useAPI } from '@utils/portalnesia';
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
import Recaptcha from './Recaptcha';
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

function Cart({cart,total,subtotal,disscount}: {cart:IItems[],total:number,subtotal:number,disscount:number}) {
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
            <ListItem>
              <ListItemText primary={c.name} secondary={
                <>
                  <Typography>{`${c.qty} x IDR ${numberFormat(`${c.price - c.disscount}`)}`}</Typography>
                  {c?.notes && <Typography variant='caption'>{`${t('notes')}: ${c?.notes}`}</Typography>}
                </>
              } />
              <ListItemSecondaryAction>
                <Typography variant='body2'>{`IDR ${numberFormat(`${(c.price*c.qty) -( c.disscount*c.qty)}`)}`}</Typography>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          <Divider sx={{my:2}} />
          <ListItem disablePadding sx={{px:2}}>
            <ListItemText primary="Subtotal" />
            <ListItemSecondaryAction>
              <Typography variant='body2'>{`IDR ${numberFormat(`${subtotal}`)}`}</Typography>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disablePadding sx={{px:2}}>
            <ListItemText primary={t("disscount")} />
            <ListItemSecondaryAction>
              <Typography variant='body2'>{`IDR ${numberFormat(`${disscount}`)}`}</Typography>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disablePadding sx={{px:2}}>
            <ListItemText primary="Total" />
            <ListItemSecondaryAction>
              <Typography variant='body2'>{`IDR ${numberFormat(`${total}`)}`}</Typography>
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
      type: IPayment|null,
      bank?: BankCode,
      ewallet?: EWalletCode
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
  const {toko_id,outlet_id} = router.query;
  const [openList,setOpenList]=useState(false)
  const [option,setOption]=useState<ITelephone[]>([]);
  const [loadingList,setLoadingList]=useState(false);
  const {outlet} = useOutlet(toko_id,outlet_id);

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
      get<Record<ITelephone['label'],ITelephone['code']>>(`/internal/list_telephone`)
      .then((res)=>{
        setLoadingList(false)
        const list = Object.keys(res).map(k=>{
            return {
                code:k,
                label:res?.[k]
            }
        })
        setOption(list);
      }).catch((err)=>{
        setLoadingList(false)
      })
    }
  },[openList,option,user])

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
              required={!!outlet?.table_number}
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
                    getOptionLabel={(option) => {
                        if (typeof option === 'string') {
                            return option;
                        }
                        return option.label
                    }}
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
                          autoComplete: 'new-password',
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
  channel_category: IPayment,
  name: string,
  channel_code: string
}

function MethodItems({dt,payment,onChange,category}: {payment:IForm['input']['payment'],dt:IPaymentMethod[],onChange(payment: IForm['input']['payment']): void,category: IPayment}) {
  const [expand,setExpand] = useState(false);

  useEffect(()=>{
    console.log("DT",dt)
  },[dt])

  const handleChange=useCallback((d: IPaymentMethod)=>()=>{
    let dt: IForm['input']['payment']|undefined;
    if(['COD','QRIS'].includes(d.channel_category)) {
      dt={
        type:d.channel_category
      }
    } else if(d.channel_category === 'VIRTUAL_ACCOUNT') {
      dt = {
        type:d.channel_category,
        bank:d.channel_code as BankCode
      }
    } else if(d.channel_category === 'EWALLET') {
      dt = {
        type:d.channel_category,
        ewallet:d.channel_code as EWalletCode
      }
    }
    if(dt) onChange(dt);
  },[onChange])

  const icon = useCallback((data: IPaymentMethod)=>{
    if(category === 'QRIS') return <QrisIcon />;
    if(category === 'EWALLET') {
      if(typeof EWalletIcon[data.channel_code as EWalletCode] !== 'undefined') {
        const Element = EWalletIcon[data.channel_code as EWalletCode];
        return <Element />;
      }
    }
    if(category === 'VIRTUAL_ACCOUNT') {
      if(typeof BankIcon[data.channel_code as BankCode] !== 'undefined') {
        const Element = BankIcon[data.channel_code as BankCode];
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
  const {toko_id,outlet_id} = router.query;
  const {data,error} = useSWR<IPaymentMethod[]>(`/sansorder/toko/${toko_id}/${outlet_id}/payment`);

  const dt = useMemo(()=>{
    if(!data) return undefined;
    const filter = data.filter(d=>{

      return d.is_enabled && ((process.env.NEXT_PUBLIC_PN_ENV === 'test' && d.channel_category !== 'EWALLET') || process.env.NEXT_PUBLIC_PN_ENV!=='test')
    });
    console.log(filter)
    const dt = filter.reduce((p,n)=>{
      (p[n.channel_category] = p[n.channel_category] || []).push(n);
      return p;
    },{} as Record<string,IPaymentMethod[]>)
    return dt;
  },[data]);

  if((!data || !dt) && !error) return <Box sx={{p:2}}><Circular /></Box>;

  if(dt) return (
    <>
      {Object.keys(dt).map(k=><MethodItems dt={dt[k]} payment={payment} onChange={onChange} category={k as IPayment} />)}
    </>
  )
  return null;
}

type PaymentResponse<D=any> = PaymentResult<D> & ({name: string,email: string})

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
            <Button href={img} download={`QRIS #${data.id}`}>Download</Button>
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
      if(data.payload.actions?.qr_checkout_string) {
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
  },[data.payload.actions?.qr_checkout_string])

  const redirectName = useMemo(()=>{
    if(typeof walletChannelCodetoEwalletCode[data.payload.channel_code] !== 'undefined') {
      return t("instruction.ewallet.redirect",{what:walletChannelCodetoEwalletCode[data.payload.channel_code]})
    }
    return t("instruction.ewallet.redirect",{what:data.payload.channel_code})
  },[data.payload.channel_code,t])

  return (
    <Box>
      {data.payload.channel_code === 'ID_SHOPEEPAY' ? (
        <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
          <Typography>{t("instruction.qris.scan")}</Typography>
          {img && (
            <Box mt={3}  display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
              <a href={isMobile ? data.payload.actions?.mobile_deeplink_checkout_url||'#' : '#'}>
                <Image src={img} dataSrc={img} fancybox={!isMobile} style={{maxWidth:'80%',height:'auto',marginLeft:'auto',marginRight:'auto'}} />
              </a>
              <Box mt={3}>
                <Button href={img} download={`ShopeePay #${data.id}`}>Download</Button>
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
    if(typeof BankIcon[data.payload.bank_code as BankCode] !== 'undefined') {
      const Element = BankIcon[data.payload.bank_code as BankCode];
      return <Element sx={{width:230,height:100}} />;
    }
    else if(typeof sendBankCode[data.payload.bank_code as BankCode] !== 'undefined') {
      return <Typography>{sendBankCode[data.payload.bank_code as BankCode]}</Typography>;
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
  const {toko_id,outlet_id} = router.query;
  const {t} = useTranslation('catalogue');
  const {t: tCom} = useTranslation('common');
  const {t: tMenu} = useTranslation('menu');
  const {post} = useAPI();
  const setNotif = useNotification();
  const [loading,setLoading] = useState<string|null>(null);
  const [input,setInput] = useState<IForm['input']>(defaultInput);
  const {outlet,errOutlet} = useOutlet(toko_id,outlet_id);
  const [menu,setMenu] = useState<PaymentResponse|null>(null);
  const [dSuccess,setDSuccess] = useState<ITransaction|null>(null);

  const captchaRef = useRef<Recaptcha>(null)
  let timeout = useRef<NodeJS.Timeout|undefined>();

  const context = useContext(Context);
  const {cart,removeCart} = context;
  const {total,subtotal,disscount} = useMemo(()=>{
    const {price,disscount} = cart.reduce((p,n)=>{
      const price = n.price * n.qty;
      const disscount = n.disscount * n.qty;
      p.price = p.price + price;
      p.disscount = p.disscount + disscount;
      return p;
    },{price:0,disscount:0})

    const total = price - disscount
    return {total,subtotal:price,disscount};
  },[cart])

  const onClose = useCallback(()=>{
    if(loading!=='submit' && handleClose) handleClose();
  },[loading,handleClose])

  const handleChangePayment = useCallback((payment: IForm['input']['payment'])=>{
    setInput({...input,payment})
  },[input])

  const handleSubmit = useCallback(async(e?: FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e?.preventDefault();
    if(!input.payment.type || !paymentType.includes(input.payment.type)) return setNotif(t("error.method"),true);
    setLoading('submit')
    try {
      const name = (!user ? input.name : user?.name) as string;
      const email = (!user ? input.email : user?.email) as string;
      const telephone = input.telephone && input.telephone.length > 0 ? `${input.tel.code}${input.telephone}` : undefined;
      const dt = {
        type:'self_order',
        cash:total,
        items:cart.map(c=>({id:c.id,qty:c.qty})),
        ...(!user ? {name,email,telephone} : {}),
        payment:input.payment,
        metadata:input.metadata
      }
      const recaptcha = await captchaRef.current?.execute();
      const response = await post<PaymentResult>(`/sansorder/toko/${toko_id}/${outlet_id}/transactions`,{...dt,recaptcha});
      const analytics = getAnalytics();
      logEvent(analytics,'purchase',{
        currency:"IDR",
        value:total,
        transaction_id: response.id,
        items: cart.map(i=>({
          item_id: `${i.id}`,
          item_name: i.name,
          discount: i.disscount,
          price: i.price,
          quantity: i.qty
        }))
      })

      removeCart();

      const r = {...response,name,email} as PaymentResponse;
      
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
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[post,toko_id,outlet_id,removeCart,input,cart,total,user,setNotif,tCom])

  const handleSimulation = useCallback(async()=>{
    if(process.env.NEXT_PUBLIC_PN_ENV !== 'test') return;
    if(!menu) return;

    setLoading('simulation')
    try {
      const recaptcha = await captchaRef.current?.execute();
      await post(`/sansorder/toko/${toko_id}/${outlet_id}/transactions/${menu.id}/simulation`,{recaptcha});

    } catch(e: any) {
      setNotif(e?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }

  },[menu,post,toko_id,outlet_id])

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
    async function handleOnTransactions(dt: ITransaction) {
      if(menu && menu.id === dt.id) {
        setDSuccess(dt);
        onClose();
        timeout.current = setTimeout(()=>{
          router.push(`/transactions/${dt.id}`);
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
                <Cart cart={cart} total={total} subtotal={subtotal} disscount={disscount} />
                {!outlet && !errOutlet ? (
                  <Box sx={{p:2}}><Circular /></Box>
                ) : errOutlet ? (
                  <Box sx={{p:2}}><Typography>{errOutlet.message}</Typography></Box>
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
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${menu.id}`}</TableCell>
                        </TableRow>
                        <TableRow sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${t("payment_method")}`}</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${menu.payment === 'VIRTUAL_ACCOUNT' ? "BANK TRANSFER" : menu.payment}`}</TableCell>
                        </TableRow>
                        <TableRow sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{t("name")}</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{menu.name}</TableCell>
                        </TableRow>
                        <TableRow sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>Email</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:0.5}}>{menu.email}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
                <Divider />
                <Box p={2} textAlign='center'>
                  <Typography>{(`${t("pay_before")} `).toUpperCase()}</Typography>
                  <Typography gutterBottom variant='h6' component='h6'>{(getDayJs(menu.expired).pn_format('full')).toUpperCase()}</Typography>
                  <Typography variant='h3' component='h3'>{`IDR ${numberFormat(`${menu.total}`)}`}</Typography>
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
          {(menu !== null && process.env.NEXT_PUBLIC_PN_ENV==='test') && (
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
                  <TableCell sx={{borderBottom:'unset',py:0.5}}>{`${dSuccess?.id}`}</TableCell>
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
      <Recaptcha ref={captchaRef} />
    </>
  )
}