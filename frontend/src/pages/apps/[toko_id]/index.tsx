// material
import { Box, Grid, Container, Typography,CardContent,CardActionArea,Card, CardMedia,Divider,IconButton } from '@mui/material';
import {AddAPhoto,Delete} from '@mui/icons-material'
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import React from 'react'
import useNotif from '@utils/notification'
import {useAPI} from '@utils/api'
import Recaptcha from '@comp/Recaptcha'
import Button from '@comp/Button'
import useToko from '@utils/useToko'
import {Circular} from '@comp/Loading'
import Image from '@comp/Image'
import Pagination,{usePagination} from '@comp/Pagination'
import {Toko, Outlet, Without,IPages, File, Nullable} from '@type/index'
import wrapper from '@redux/store'
import {useTranslation,TFunction} from 'next-i18next';
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

export const getServerSideProps = wrapper({name:'check_toko',outlet:{onlyMyToko:true},translation:'dash_toko'});

const MENU = (t: TFunction,tCom:TFunction)=>([
  {
    id:"setting",
    title:`Edit Merchant`,
    icon:"akar-icons:edit",
  },{
    id:"outlet",
    title:tCom("add_ctx",{what:"Outlet"}),
    icon:"fluent:form-new-20-regular",
  },{
    id:"wallet",
    title:t("wallet"),
    icon:"fluent:wallet-credit-card-16-regular",
  },{
    id:"delete",
    title:tCom("del_ctx",{what:"Merchant"}),
    icon:"fluent:delete-16-regular",
    sx:{
      color:'error.main'
    }
  }
])


export default function DashboardApp({meta}: IPages<Toko>) {
  const {t} = useTranslation('dash_toko');
  const {t:tCom} = useTranslation('common');
  const router = useRouter();
  const toko_id = router?.query?.toko_id
  const [page,setPage] = usePagination(true);
  const setNotif = useNotif()
  const {del,post,put} = useAPI();
  const [loading,setLoading] = React.useState<string|null>(null);
  const [dBrowser,setDBrowser] = React.useState(false);
  const [dDelete,setDDelete] = React.useState(false);
  const [dOutlet,setDOutlet] = React.useState(false);
  const [dEdit,setDEdit] = React.useState(false);
  const [iOutlet,setIOutlet] = React.useState({name:'',description:'',address:''});
  const [iEdit,setIEdit] = React.useState<Nullable<Without<Toko,'id'|'slogan'|'slug'>>>({name:'',description:'',logo:null});

  const {toko,errToko,mutateToko} = useToko(toko_id,{fallback:meta});
  const {data:outlet,error:errorOutlet,mutate:mutateOutlet} = useSWR<Outlet,true>(`/tokos/${toko_id}/outlets?page=${page}&pageSize=12`)
  const menus = React.useMemo(()=>MENU(t,tCom),[t,tCom])

  const handleSelectedImage=React.useCallback((type:'add'|'delete')=>(logo: File|null)=>{
    setIEdit(p=>({...p,logo}))
  },[setIEdit])

  const handleDeletedImages = React.useCallback((dt: File)=>{
    if(iEdit.logo?.id === dt.id) setIEdit({...iEdit,logo:null})
  },[iEdit])

  const openSetting = React.useCallback(()=>{
    if(toko) {
      setIEdit({name:toko.data.name,description:toko.data.description||'',logo:toko.data.logo?.id ? toko.data.logo : null})
    }
    setDEdit(true);
  },[toko])

  const openCreateOutlet = React.useCallback(()=>{
    setIOutlet({name:'',description:'',address:''})
    setDOutlet(true);
  },[])

  const openWallet = React.useCallback(()=>{
    router.push(`/apps/${toko_id}/wallet`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[toko_id])

  const deleteToko = React.useCallback(()=>{
    setDDelete(true)
  },[])

  const handleMenu = React.useCallback((type: string)=>()=>{
    if(type === 'setting') return openSetting();
    if(type === 'outlet') return openCreateOutlet();
    if(type === 'wallet') return openWallet();
    if(type === 'delete') return deleteToko();
  },[openSetting,openWallet,deleteToko,openCreateOutlet])

  const handleDelete=React.useCallback(async()=>{
    setLoading('delete');
    try {
      await del(`/tokos/${toko?.data?.id}`)
      setLoading(null);
      setNotif(tCom("save"),false);
      router.push('/apps');
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[del,setNotif,toko,tCom])

  const handleEdit = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading('edit');
    try {
      await put(`/tokos/${toko?.data?.id}`,{...iEdit,logo: iEdit?.logo?.id||null});
      mutateToko();
      setDEdit(false);
      setNotif(tCom("saved"),false);
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[put,setNotif,iEdit,toko,tCom,mutateToko])

  const handleOutlet = React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading('outlet');
    try {
      await post<{id: number,slug: string}>(`/outlets/`,{...iOutlet,toko:toko?.data?.id});
      setPage({},1);
      mutateOutlet();
      setDOutlet(false);
      setNotif(tCom("saved"),false);
    } catch(e: any) {
      setNotif(e?.error?.message||tCom("error_500"),true);
    } finally {
      setLoading(null)
    }
  },[post,setNotif,iOutlet,toko,tCom,mutateOutlet,setPage])

  return (
    <Header title={toko?.data?.name} desc={toko?.data?.description}>
      <Dashboard withNavbar={false} backToTop={{position:'bottom',color:'primary'}} whatsappWidget={{enabled:false}}>
        <Container maxWidth='lg' sx={{mb:6}}>
          {toko && (
            <Box>
              <Breadcrumbs title={toko?.data?.name} routes={[{label:"Merchant",href:"/apps"}]} />    
            </Box>
          )}
          <Box>
            <Button text icon='back' iconPosition='start' onClick={()=>router.back()}>{tCom("back")}</Button>
          </Box>
        </Container>
        <Container maxWidth='lg'>
          {(!toko && !errToko || !toko) ? (
            <Box display='flex'><Circular /></Box>
          ) : errToko ? (
            <Box display='flex' alignItems='center' flexGrow='1' justifyContent='center'>
              <Typography variant='h3' component='h3'>{errToko?.error.message}</Typography>
            </Box>
          ) : (
            <>
              <Box pb={2} mb={5}>
                <Typography variant="h2" component='h2'>{toko?.data?.name}</Typography>
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
                    <Box textAlign='center'><Typography>{errorOutlet.error.message}</Typography></Box>
                  </Grid>
                ) : outlet?.data?.length === 0 ? (
                  <Grid item xs={12}>
                    <Box textAlign='center'><Typography>{tCom("no_what",{what:"Outlet"})}</Typography></Box>
                  </Grid>
                ) : outlet?.data.map((d,i)=>(
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
                    <Card>
                      <CardActionArea onClick={()=>router.push(`/apps/${toko.data?.slug}/${d.id}`)}>
                        <CardContent>
                          <Typography>{d.name}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
                {(outlet?.meta?.pagination?.pageCount||1) > 1 && (
                  <Grid item xs={12}>
                    <Box mt={2}><Pagination page={page} count={outlet?.meta?.pagination?.pageCount||1} onChange={setPage} /></Box>
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </Container>
        <Dialog loading={loading!==null} open={dDelete} handleClose={()=>setDDelete(false)} fullScreen={false}>
          <DialogTitle>{`${tCom("del_ctx",{what:toko?.data?.name})}?`}</DialogTitle>
          <DialogContent>
            {t("delete").split("\n").map((t,i)=>(
              <Typography gutterBottom key={`toko-delete-${i}`}>{t}</Typography>
            ))}
            <Typography gutterBottom key={`toko-delete-wallet`} sx={{fontWeight:'bold'}}>{`*${t("delete_wallet")}`}</Typography>
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' onClick={()=>setDDelete(false)} disabled={loading!==null}>{tCom("cancel")}</Button>
            <Button color='error' icon='delete' onClick={handleDelete} loading={loading==='delete'}>{tCom("del")}</Button>
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
                    label={tCom("name_ctx",{what:"Merchant"})}
                    fullWidth
                    autoFocus
                    required
                    disabled={loading!==null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SimpleMDE noSideBySide disabled={loading!==null} value={iEdit.description||''} onChange={(e)=>setIEdit({...iEdit,description:e})} label={tCom("description")} />
                </Grid>
                <Grid item xs={12}>
                  {iEdit.logo?.id ? (
                    <Box padding={{sm:2,md:3,lg:5}} display='flex' justifyContent={'center'}>
                      <Image alt="Logo" src={iEdit.logo.url} style={{maxWidth:500}} />
                    </Box>
                  ) : (
                    <Box textAlign='center' padding={{sm:2,md:3,lg:5}}>
                      <Typography>{tCom("no_what",{what:"logo"})}</Typography>
                    </Box>
                  )}
                  <Box className='flex-header' pl={{sm:2,md:3,lg:5}} pr={{sm:2,md:3,lg:5}}>
                    <Tooltip title={tCom("remove_ctx",{what:"Logo"})}><IconButton disabled={(!(!!iEdit.logo))||loading!==null} sx={{color:'error.main'}} onClick={()=>handleSelectedImage('delete')(null)}><Delete /></IconButton></Tooltip>
                    <Tooltip title={iEdit.logo?.id ? tCom("change_ctx",{what:"Logo"}) : tCom("add_ctx",{what:"Logo"})}><IconButton disabled={loading!==null} sx={{color:'primary.main'}} onClick={()=>setDBrowser(true)}><AddAPhoto /></IconButton></Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button text color='inherit' onClick={()=>setDEdit(false)} disabled={loading!==null}>{tCom("cancel")}</Button>
              <Button icon='submit' loading={loading==='edit'} type='submit'>{tCom("save")}</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog loading={loading!==null} open={dOutlet} handleClose={()=>setDOutlet(false)}>
          <form onSubmit={handleOutlet}>
            <DialogTitle>{tCom("create_ctx",{what:"Outlet"})}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    value={iOutlet.name}
                    onChange={(e)=>setIOutlet({...iOutlet,name:e.target.value})}
                    label={tCom("name_ctx",{what:"Outlet"})}
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
                    label={t("address")}
                    fullWidth
                    disabled={loading!==null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SimpleMDE noSideBySide disabled={loading!==null} value={iOutlet.description||''} onChange={(e)=>setIOutlet({...iOutlet,description:e})} label={tCom("description")} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button text color='inherit' onClick={()=>setDOutlet(false)} disabled={loading!==null}>{tCom("cancel")}</Button>
              <Button icon='submit' loading={loading==='outlet'} type='submit'>{tCom("save")}</Button>
            </DialogActions>
          </form>
        </Dialog>
        <Browser open={dBrowser} onClose={()=>setDBrowser(false)} onSelected={handleSelectedImage('add')} onDeleted={handleDeletedImages} />
      </Dashboard>
    </Header>
  )
}
