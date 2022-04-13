import {useCallback,useMemo,useState,useContext,FormEvent, ChangeEvent,useEffect, Fragment} from 'react'
import {Box,Typography,Stack,IconButton,Slide,Fade,Collapse,ListItem,List,ListItemText,ListItemSecondaryAction, Divider,Grid, TextField,Autocomplete, CircularProgress, Paper } from '@mui/material'
import {Close,ArrowBackIosRounded,ExpandMore as ExpandMoreIcon} from '@mui/icons-material'
import Button from './Button';
import { useTranslations } from 'use-intl';
import { BankCode, CopyRequired, EWalletCode, EWalletResults, IItems, IPayment, paymentCodeName, PaymentResult, paymentType, QrCodeResults, VirtualAccResults } from '@type/index';
import { Context } from '@redux/cart';
import { useSelector,State } from '@redux/index';
import ExpandMore from './ExpandMore';

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
  const t = useTranslations();
  const [expand,setExpand] = useState(false);
  return (
    <>
      <Button onClick={()=>setExpand(!expand)} sx={{width:'100%',borderRadius:0,px:2,py:1}} text color='inherit'>
        <Typography>{`${t("Payment.order_summary")} (${cart.length} items)`}</Typography>
        <ExpandMore disabled={!expand} onClick={()=>setExpand(!expand)} expand={expand}>
          <ExpandMoreIcon />
        </ExpandMore>
      </Button>
      <Collapse unmountOnExit in={expand}>
        <Divider />
        <List>
          {cart.map((c,i)=>(
            <ListItem>
              <ListItemText primary={c.name} secondary={`${c.qty} x IDR ${numberFormat(`${c.price - c.disscount}`)}`} />
              <ListItemSecondaryAction>
                <Typography variant='body2'>{`IDR ${numberFormat(`${(c.price*c.qty) -( c.disscount*c.qty)}`)}`}</Typography>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          <Divider sx={{my:2}} />
          <ListItem>
            <ListItemText primary="Subtotal" />
            <ListItemSecondaryAction>
              <Typography variant='body2'>{`IDR ${numberFormat(`${subtotal}`)}`}</Typography>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("Product.disscount")} />
            <ListItemSecondaryAction>
              <Typography variant='body2'>{`IDR ${numberFormat(`${disscount}`)}`}</Typography>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
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
  const t = useTranslations();
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
    if(option.length === 0) {
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
  },[openList,option])

  return (
    <Box sx={{p:2}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {table_number ? (
            <Typography>{`${t("Subcribe.feature.table_number")}: ${table_number}`}</Typography>
          ) : (
            <TextField
              fullWidth
              label={t("Subcribe.feature.table_number")}
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
                label={t("General._name")}
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
                <Grid item xs={4}>
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
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label={t("General.telephone")}
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

function MethodItems({dt,payment,onChange}: {payment:IForm['input']['payment'],dt:Record<string,IPaymentMethod[]>,onChange(payment: IForm['input']['payment']): void}) {
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

  return (
    <>
      {Object.keys(dt).map(k=>(
        <Fragment key={k}>
          <Button onClick={()=>setExpand(!expand)} sx={{width:'100%',borderRadius:0,px:2,py:1,borderBottom:(theme)=>`1px solid ${theme.palette.divider}`}} text color='inherit'>
            <Typography>{paymentCodeName[k as IPayment]}</Typography>
            <ExpandMore disabled={!expand} onClick={()=>setExpand(!expand)} expand={expand}>
              <ExpandMoreIcon />
            </ExpandMore>
          </Button>

          <Collapse unmountOnExit in={expand}>
            <Box py={2} px={2}>
              <Grid container spacing={2}>
                {dt[k].map((d,i)=>(
                  <Grid key={d.channel_code} item xs={6} md={4}>
                    <Button {...(payment.type === d.channel_category ? {} : {outlined:true,color:'inherit'})} onClick={handleChange(d)}>
                      <Typography>{d.name}</Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </Fragment>
      ))}
    </>
  )
}

function Method({payment,onChange}: {payment:IForm['input']['payment'],onChange(payment: IForm['input']['payment']): void}) {
  const t = useTranslations();
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const {data,error} = useSWR<IPaymentMethod[]>(`/toko/${toko_id}/${outlet_id}/payment`);

  const dt = useMemo(()=>{
    if(!data) return undefined;
    const filter = data.filter(d=>d.is_enabled);
    const dt = filter.reduce((p,n)=>{
      (p[n.channel_category] = p[n.channel_category] || []).push(n);
      return p;
    },{} as Record<string,IPaymentMethod[]>)
    return dt;
  },[data]);

  if((!data || !dt) && !error) return <Box sx={{p:2}}><Circular /></Box>;

  if(dt) return <MethodItems dt={dt} payment={payment} onChange={onChange} />
  return null;
}

type PaymentResponse<D=any> = PaymentResult<D> & ({name: string,email: string})

function CodInformation({data}: {data: PaymentResponse}) {
  const t = useTranslations();
  return (
    <Box>
      <Typography variant='h6' component='h6'>{t("Payment.instruction.title")}</Typography>
      <List component={'ol'} sx={{listStyle:'decimal',listStylePosition:'inside'}}>
        {t("Payment.instruction.cod").split("\n").map((k,i)=>(
          <ListItem key={`cod-${i}`} disablePadding sx={{display:'list-item'}}>{k}</ListItem>
        ))}
      </List>
    </Box>
  )
}

function QrisInformation({data}: {data: PaymentResponse<QrCodeResults>}) {
  const t = useTranslations();
  return (
    <Box>
      <List component={'ol'} sx={{listStyle:'decimal',listStylePosition:'inside'}}>
        <ListItem disablePadding sx={{display:'list-item'}}>pergi ke</ListItem>
      </List>
    </Box>
  )
}

function EwalletInformation({data}: {data: PaymentResponse<EWalletResults>}) {
  const t = useTranslations();
  return (
    <Box>
      <List component={'ol'} sx={{listStyle:'decimal',listStylePosition:'inside'}}>
        <ListItem disablePadding sx={{display:'list-item'}}>pergi ke</ListItem>
      </List>
    </Box>
  )
}

function VaInformation({data}: {data: PaymentResponse<VirtualAccResults>}) {
  const t = useTranslations();
  return (
    <Box>
      <List component={'ol'} sx={{listStyle:'decimal',listStylePosition:'inside'}}>
        <ListItem disablePadding sx={{display:'list-item'}}>pergi ke</ListItem>
      </List>
    </Box>
  )
}

export default function PaymentMethod({open,handleClose,table_number}: PaymentProps) {
  const user = useSelector<State['user']>(s=>s.user);
  const router = useRouter();
  const {toko_id,outlet_id} = router.query;
  const t = useTranslations();
  const {post} = useAPI();
  const setNotif = useNotification();
  const [loading,setLoading] = useState<string|null>(null);
  const [input,setInput] = useState<IForm['input']>(defaultInput);
  const {outlet,errOutlet} = useOutlet(toko_id,outlet_id);
  const [menu,setMenu] = useState<PaymentResponse|null>(null);

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
    if(!input.payment.type || !paymentType.includes(input.payment.type)) return setNotif(t("Payment.error.method"),true);
    setLoading('submit')
    try {
      const name = (!user ? input.name : user?.name) as string;
      const email = (!user ? input.email : user?.email) as string;
      const telephone = input.telephone && input.telephone.length > 0 ? `${input.tel.code}${input.telephone}` : undefined;
      const dt = {
        cash:total,
        items:cart.map(c=>({id:c.id,qty:c.qty})),
        ...(!user ? {name,email,telephone} : {})
      }
      console.log(dt);
      setTimeout(()=>{
        setLoading(null);
        const expired = getDayJs().add(2,'h').unix();
        setMenu({name,email,id:'12345',payment:"COD",cash:total,total,subtotal:total,disscount:0,changes:0,expired:expired,payload:{}})
        //removeCart();
      },3000)
    } catch(e: any) {

    } finally {

    }
  },[post,toko_id,outlet_id,removeCart,input,cart,total,user,setNotif,t])

  useEffect(()=>{
    if(!open) {
      setInput(defaultInput)
      setMenu(null);
      setLoading(null);

    }
  },[open])
  
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
                <Typography variant='h6'>{t("Payment.payment_method")}</Typography>
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
                        <TableRow hover sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:1}}>{`${t("General.id",{what:t("Menu.transactions")})}`}</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:1}}>{`${menu.id}`}</TableCell>
                        </TableRow>
                        <TableRow hover sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:1}}>{`${t("Payment.payment_method")}`}</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:1}}>{`${menu.payment}`}</TableCell>
                        </TableRow>
                        <TableRow hover sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:1}}>{t("General._name")}</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:1}}>{menu.name}</TableCell>
                        </TableRow>
                        <TableRow hover sx={{borderBottom:'unset'}}>
                          <TableCell sx={{borderBottom:'unset',py:1}}>Email</TableCell>
                          <TableCell sx={{borderBottom:'unset',py:1}}>{menu.email}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
                <Divider />
                <Box p={2} textAlign='center'>
                  <Typography>{(`${t("Payment.pay_before")} `).toUpperCase()}</Typography>
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
              <Button type='submit' disabled={loading!==null} loading={loading==='submit'} icon='submit'>{t("Payment.pay")}</Button>
            </DialogActions>
          )}
        </form>
      </Dialog>
      <Backdrop open={loading==='submit'} />
    </>
  )
}