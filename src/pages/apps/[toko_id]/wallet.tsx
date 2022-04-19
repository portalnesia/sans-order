// material
import { Box, Grid, Container, Typography,CardContent,CardActionArea,Card, CardMedia,Divider,IconButton } from '@mui/material';
import {AddAPhoto,Delete} from '@mui/icons-material'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/portalnesia'
import Recaptcha from '@comp/Recaptcha'
import Button from '@comp/Button'
import Backdrop from '@comp/Backdrop'
import {Circular} from '@comp/Loading'
import Image from '@comp/Image'
import Pagination,{usePagination} from '@comp/Pagination'
import {sendAllCodeArray} from '@type/payment'
import type {IToko,IOutletPagination,ResponsePagination, Without,IPages} from '@type/index'
import wrapper from '@redux/store'
import {useTranslations} from 'next-intl';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import Select from '@comp/Select'
import Breadcrumbs from '@comp/Breadcrumbs';
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const TextField=dynamic(()=>import('@mui/material/TextField'))
const Browser = dynamic(()=>import('@comp/Browser'))
const Tooltip = dynamic(()=>import('@mui/material/Tooltip'))

export const getServerSideProps = wrapper({name:'check_toko',outlet:{onlyMyToko:true}});

type IForm = {
  bank_code: string,
  account_name: string,
  account_number: string|number
}

interface FormProps {
  input: IForm,
  setInput: (type: keyof IForm)=>(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>void
  disabled?: boolean
}

export function Form({input,setInput,disabled}: FormProps) {
  const t = useTranslations();

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <TextField
          select
          label={t("Payment.withdraw_method")}
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
          label={t("Payment.account_number")}
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
          label={t("Payment.account_name")}
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

export default function WalletPage({meta}: IPages) {
  const router = useRouter();
  const t = useTranslations();
  const setNotif = useNotif();
  const toko_id = router.query?.toko_id;
  const [dialog,setDialog] = React.useState(false);
  const [loading,setLoading] = React.useState(false);
  const [input,setInput] = React.useState<IForm>({bank_code:'MANDIRI',account_name:'',account_number:''})
  const {post} = useAPI();
  const {data,error,mutate} = useSWR<{payload?: IForm}>(`/toko/${toko_id}/wallet`,{shouldRetryOnError:(e)=>{
    return e?.httpStatus !== 404;
  }});
  const captchaRef = React.useRef<Recaptcha>(null);

  const handleChange=React.useCallback((name: keyof IForm)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
    setInput({...input,[name]:e.target.value});
  },[input])

  const handleSubmit = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const recaptcha = await captchaRef.current?.execute();
      await post(`/toko/${toko_id}/wallet`,{...input,recaptcha});
      setNotif(t("General.success"),false);
      mutate();
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(false)
    }
  },[post,setNotif,input,t])

  React.useEffect(()=>{
    if(data && data.payload) {
      setInput(data.payload);
    }
  },[data])

  return (
    <Header title={t("General.wallet")}>
      <Dashboard withNavbar={false}>
        <Container maxWidth='lg' sx={{mb:6}}>
          {meta?.title && (
            <>
              <Box>
                <Breadcrumbs title={t("General.wallet")} routes={[{label:"Merchant",href:"/apps"},{label:meta?.title,href:"/apps/[toko_id]",as:`/apps/${toko_id}`}]} />    
              </Box>
              <Box className='flex-header'>
                <Button text icon='back' iconPosition='start' onClick={()=>router.back()}>{t("General.back")}</Button>
                {error && error?.httpStatus === 404 && (
                  <Button onClick={()=>setDialog(true)}>{t("General.create",{what:t("General.wallet")})}</Button>
                )}
              </Box>
            </>
          )}
        </Container>
        <Container maxWidth='md'>
          {!data && !error ? (
            <Box display='flex'><Circular /></Box>
          ) : error && error.httpStatus !== 404 ? (
            <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
              <Typography variant='h3' component='h3'>{error?.message}</Typography>
            </Box>
          ) : error ? (
            <Box>
              <Typography gutterBottom variant='h4' component='h4'>{t("Wallet.no_wallet_title")}</Typography>
              <Typography gutterBottom>{t("Wallet.no_wallet")}</Typography>
              <Typography gutterBottom>{t("Wallet.delete")}</Typography>

              <Dialog loading={loading} open={dialog} handleClose={()=>setDialog(false)}>
                <form onSubmit={handleSubmit}>
                  <DialogTitle>{t("General.create",{what:t("General.wallet")})}</DialogTitle>
                  <DialogContent dividers>
                    <Form input={input} setInput={handleChange} disabled={loading} />
                  </DialogContent>
                  <DialogActions>
                    <Button text color='inherit' onClick={()=>setDialog(false)}>{t("General.cancel")}</Button>
                    <Button disabled={loading} loading={loading}>{t("General.save")}</Button>
                  </DialogActions>
                </form>
              </Dialog>
            </Box>
          ) : (
            <>
              <Box pb={2} mb={5}>
                <Typography variant="h2" component='h2'>{t("General.wallet")}</Typography>
                <Divider />
                <Box>
                  <form onSubmit={handleSubmit}>
                    <Form input={input} setInput={handleChange} disabled={loading} />

                  </form>
                </Box>
              </Box>
            </>
          )}
        </Container>
        <Recaptcha ref={captchaRef} />
      </Dashboard>
    </Header>
  )
}