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
import useToko from '@utils/useToko'
import {Circular} from '@comp/Loading'
import Image from '@comp/Image'
import Pagination,{usePagination} from '@comp/Pagination'
import {IToko,IOutletPagination,ResponsePagination, Without,IPages} from '@type/index'
import wrapper from '@redux/store'
import {useTranslations} from 'next-intl';
import useSWR from '@utils/swr';
import { useRouter } from 'next/router';
import Iconify from '@comp/Iconify';
import Breadcrumbs from '@comp/Breadcrumbs';
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const TextField=dynamic(()=>import('@mui/material/TextField'))
const Browser = dynamic(()=>import('@comp/Browser'),{ssr:false})
const Tooltip = dynamic(()=>import('@mui/material/Tooltip'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'),{ssr:false})

export const getServerSideProps = wrapper({name:'check_toko'});

const MENU = (t: ReturnType<typeof useTranslations>)=>([
  {
    id:"setting",
    title:`Edit Merchant`,
    icon:"akar-icons:edit",
  },{
    id:"outlet",
    title:t("General.add",{what:"Outlet"}),
    icon:"fluent:form-new-20-regular",
  },{
    id:"wallet",
    title:t("General.wallet"),
    icon:"fluent:wallet-credit-card-16-regular",
  },{
    id:"delete",
    title:t("General.delete",{what:"Merchant"}),
    icon:"fluent:delete-16-regular",
    sx:{
      color:'error.main'
    }
  }
])

export default function DashboardApp({meta}: IPages) {
  const t = useTranslations();
  const router = useRouter();
  const toko_id = router?.query?.toko_id
  const [page,setPage] = usePagination();
  const setNotif = useNotif()
  const {del,post,put} = useAPI();
  const [loading,setLoading] = React.useState<string|null>(null);
  const [dBrowser,setDBrowser] = React.useState(false);
  const [dDelete,setDDelete] = React.useState(false);
  const [dOutlet,setDOutlet] = React.useState(false);
  const [dEdit,setDEdit] = React.useState(false);
  const [iOutlet,setIOutlet] = React.useState({name:'',description:'',address:''});
  const [iEdit,setIEdit] = React.useState<Without<IToko,'id'|'slogan'|'slug'>>({name:'',description:'',logo:null});

  const {toko,errToko,mutateToko} = useToko(toko_id);
  const {data:outlet,error:errorOutlet,mutate:mutateOutlet} = useSWR<ResponsePagination<IOutletPagination>>(`/toko/${toko_id}/outlet?page=${page}&per_page=12`)
  const captchaRef = React.useRef<Recaptcha>(null)
  const menus = React.useMemo(()=>MENU(t),[t])

  const handleSelectedImage=React.useCallback((type:'add'|'delete')=>(logo: string|null)=>{
    setIEdit(p=>({...p,logo}))
  },[setIEdit])

  const openSetting = React.useCallback(()=>{
    if(toko) {
      setIEdit({name:toko.name,description:toko.description||'',logo:toko.logo})
    }
    setDEdit(true);
  },[toko])

  const openCreateOutlet = React.useCallback(()=>{
    setIOutlet({name:'',description:'',address:''})
    setDOutlet(true);
  },[])

  const openWallet = React.useCallback(()=>{
    router.push(`/apps/${toko_id}/wallet`)
  },[toko_id])

  const deleteToko = React.useCallback(()=>{
    setDDelete(true)
  },[])

  const handleMenu = React.useCallback((type: string)=>()=>{
    if(type === 'setting') return openSetting();
    if(type === 'outlet') return openCreateOutlet();
    if(type === 'wallet') return openWallet();
    if(type === 'delete') return deleteToko();


  },[openSetting,openWallet,deleteToko])

  const handleDelete=React.useCallback(async()=>{
    setLoading('delete');
    try {
      await del(`/toko/${toko?.slug}`)
      setLoading(null);
      setNotif(t("General.success"),false);
      router.push('/apps');
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    }
  },[del,setNotif,toko,t])

  const handleEdit = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading('edit');
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/toko/${toko?.slug}`,{...iEdit,recaptcha});
      mutateToko();
      setDEdit(false);
      setNotif(t("General.saved"),false);
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(null)
    }
  },[put,setNotif,iEdit,toko])

  const handleOutlet = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading('outlet');
    try {
      console.log("OUTLET")
      const recaptcha = await captchaRef.current?.execute();
      console.log(recaptcha)
      await post<{id: number,slug: string}>(`/toko/${toko?.slug}/outlet`,{...iOutlet,recaptcha});
      setPage({},1);
      mutateOutlet();
      setDOutlet(false);
      setNotif(t("General.saved"),false);
    } catch(e: any) {
      setNotif(e?.message||t("General.error"),true);
    } finally {
      setLoading(null)
    }
  },[post,setNotif,iOutlet,toko])

  return (
    <Header title={meta?.title} desc={meta?.description}>
      <Dashboard withNavbar={false}>
        <Container maxWidth='lg' sx={{mb:6}}>
          {toko && (
            <Box>
              <Breadcrumbs title={toko?.name} routes={[{label:"Merchant",href:"/apps"}]} />    
            </Box>
          )}
          <Box>
            <Button text icon='back' iconPosition='start' onClick={()=>router.back()}>{t("General.back")}</Button>
          </Box>
        </Container>
        <Container maxWidth='lg'>
          {(!toko && !errToko || !toko) ? (
            <Box display='flex'><Circular /></Box>
          ) : errToko ? (
            <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
              <Typography variant='h3' component='h3'>{errToko?.message}</Typography>
            </Box>
          ) : (
            <>
              <Box pb={2} mb={5}>
                <Typography variant="h2" component='h2'>{toko?.name}</Typography>
                <Divider />
              </Box>

              <Grid container spacing={2} sx={{mb:10}}>
                {menus.map((m,i)=>(
                  <Grid item xs={6} sm={4} md={3} key={`menu-${i}`}>
                    <Card>
                      <CardActionArea onClick={handleMenu(m.id)}>
                        <CardContent sx={{textAlign:"center"}}>
                          <CardMedia>
                            <Iconify icon={m.icon} sx={{fontSize:55,...m?.sx}} />
                          </CardMedia>
                          <Typography {...(m?.sx ? {sx:m.sx} : {})}>{m.title}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box pb={2} mb={1}>
                <Typography variant="h3" component='h3'>OUTLET</Typography>
                <Divider />
              </Box>

              <Grid container spacing={2}>
                {!outlet && !errorOutlet ? (
                  <Grid item xs={12}>
                    <Box display='flex'><Circular /></Box>
                  </Grid>
                ) : errorOutlet ? (
                  <Grid item xs={12}>
                    <Box textAlign='center'><Typography>{errorOutlet.message}</Typography></Box>
                  </Grid>
                ) : outlet?.data?.length === 0 ? (
                  <Grid item xs={12}>
                    <Box textAlign='center'><Typography>{t("General.no",{what:"Outlet"})}</Typography></Box>
                  </Grid>
                ) : outlet?.data.map((d,i)=>(
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
                    <Card>
                      <CardActionArea onClick={()=>router.push(`/apps/${toko.slug}/${d.id}`)}>
                        <CardContent>
                          <Typography>{d.name}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
                {(outlet?.total_page||1) > 1 && (
                  <Grid item xs={12}>
                    <Box mt={2}><Pagination page={page} count={outlet?.total_page||1} onChange={setPage} /></Box>
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </Container>
        <Dialog loading={loading!==null} open={dDelete} handleClose={()=>setDDelete(false)}>
          <DialogTitle>{`${t("General.delete",{what:toko?.name})}?`}</DialogTitle>
          <DialogContent>
            {t("Toko.delete").split("\n").map((t,i)=>(
              <Typography gutterBottom key={`toko-delete-${i}`}>{t}</Typography>
            ))}
            <Typography gutterBottom key={`toko-delete-wallet`} sx={{fontWeight:'bold'}}>{`*${t("Wallet.delete_wallet")}`}</Typography>
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' onClick={()=>setDDelete(false)} disabled={loading!==null}>{t("General.cancel")}</Button>
            <Button color='error' icon='delete' onClick={handleDelete} loading={loading==='delete'}>{t("General._delete")}</Button>
          </DialogActions>
        </Dialog>

        <Dialog loading={loading!==null} open={dEdit} handleClose={()=>setDEdit(false)}>
          <form onSubmit={handleEdit}>
            <DialogTitle>EDIT</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    value={iEdit.name}
                    onChange={(e)=>setIEdit({...iEdit,name:e.target.value})}
                    label={t("General.name",{what:"Merchant"})}
                    fullWidth
                    autoFocus
                    required
                    disabled={loading!==null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SimpleMDE noSideBySide disabled={loading!==null} value={iEdit.description||''} onChange={(e)=>setIEdit({...iEdit,description:e})} label={t("General.description")} />
                </Grid>
                <Grid item xs={12}>
                  {iEdit.logo ? (
                    <Box padding={{sm:2,md:3,lg:5}}>
                      <Image alt="Logo" src={iEdit.logo} style={{maxWidth:500}} />
                    </Box>
                  ) : (
                    <Box textAlign='center' padding={{sm:2,md:3,lg:5}}>
                      <Typography>{t("General.no",{what:"logo"})}</Typography>
                    </Box>
                  )}
                  <Box className='flex-header' pl={{sm:2,md:3,lg:5}} pr={{sm:2,md:3,lg:5}}>
                    <Tooltip title={t("General.remove",{what:"Logo"})}><IconButton disabled={(!(!!iEdit.logo))||loading!==null} sx={{color:'error.main'}} onClick={()=>handleSelectedImage('delete')(null)}><Delete /></IconButton></Tooltip>
                    <Tooltip title={iEdit.logo ? t("General.change",{what:"Logo"}) : t("General.add",{what:"Logo"})}><IconButton disabled={loading!==null} sx={{color:'primary.main'}} onClick={()=>setDBrowser(true)}><AddAPhoto /></IconButton></Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button text color='inherit' onClick={()=>setDEdit(false)} disabled={loading!==null}>{t("General.cancel")}</Button>
              <Button icon='submit' loading={loading==='edit'} type='submit'>{t("General.save")}</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog loading={loading!==null} open={dOutlet} handleClose={()=>setDOutlet(false)}>
          <form onSubmit={handleOutlet}>
            <DialogTitle>{t("General.create",{what:"Outlet"})}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    value={iOutlet.name}
                    onChange={(e)=>setIOutlet({...iOutlet,name:e.target.value})}
                    label={t("General.name",{what:"Outlet"})}
                    fullWidth
                    autoFocus
                    required
                    disabled={loading!==null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    value={iOutlet.address||''}
                    onChange={(e)=>setIOutlet({...iOutlet,address:e.target.value})}
                    label={t("Toko.address")}
                    fullWidth
                    disabled={loading!==null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SimpleMDE noSideBySide disabled={loading!==null} value={iOutlet.description||''} onChange={(e)=>setIOutlet({...iOutlet,description:e})} label={t("General.description")} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button text color='inherit' onClick={()=>setDOutlet(false)} disabled={loading!==null}>{t("General.cancel")}</Button>
              <Button icon='submit' loading={loading==='outlet'} type='submit'>{t("General.save")}</Button>
            </DialogActions>
          </form>
        </Dialog>
        <Recaptcha ref={captchaRef} />
        <Browser open={dBrowser} onClose={()=>setDBrowser(false)} onSelected={handleSelectedImage('add')} />
      </Dashboard>
    </Header>
  )
}
