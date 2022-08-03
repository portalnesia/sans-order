// material
import { Box, Grid, Container, Typography,styled,CardContent,CardActionArea,Card,Stack,Alert, CardMedia, Divider,CircularProgress, List, ListItem } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import AuthLayout from '@layout/AuthLayout'
import React from 'react'
import Image from '@comp/Image'
import Pagination,{usePagination} from '@comp/Pagination'
import {staticProps,useSelector,State,useDispatch, PortalnesiaUser} from '@redux/index'
import {useTranslation} from 'next-i18next';
import Button from '@comp/Button'
import {useRouter} from 'next/router'
import portalnesia,{useAPI} from '@utils/api'
import SessionStorage from '@utils/session-storage';
import useNotif from '@utils/notification'
import useSWR from '@utils/swr'
import Backdrop from '@comp/Backdrop'
import {ucwords} from '@portalnesia/utils'
import {photoUrl} from '@utils/Main'
import {Circular} from '@comp/Loading'
import useInitData from '@utils/init-data'
import {Toko,Outlet} from '@type/index'
import dynamic from 'next/dynamic'
import { getSysInfo, PSysInfo } from '@comp/Feedback';
import { SplashScreen } from '@comp/Loader';

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const TextField=dynamic(()=>import('@mui/material/TextField'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'),{ssr:false})

export const getStaticProps = staticProps({translation:'dash_apps'});

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 5)
}));

function LoginSection() {
  const {t} = useTranslation('dash_apps');
  const {t:tMenu} = useTranslation('menu');
  const router = useRouter();
  const err = router.query?.error_description;

  const login = React.useCallback(()=>{
    const url = portalnesia.getAuthUrl();
    window.location.href = url;
  },[])

  return (
    <RootStyle>
      <AuthLayout>
        {t("not_register")} &nbsp;<a href={`${process.env.ACCOUNT_URL}/register`}>{t("register")}</a>
      </AuthLayout>

      <SectionStyle sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
          {t("hi")}
        </Typography>
        <Image src="/static/illustrations/illustration_login.png" alt="Login" />
      </SectionStyle>

      <Container maxWidth="sm">
        <ContentStyle>
          <Stack sx={{ mb: 5,alignItems:'center' }}>
            <Typography variant="h4" gutterBottom>
              {t("signin")}
            </Typography>
            <Button onClick={login} sx={{mt:3,backgroundColor:'#2f6f4e !important'}} size="large" startIcon={<Image src="/portalnesia-icon/android-icon-48x48.png" width={25} />}>{tMenu("signin")}</Button>
            {typeof err === 'string' && (
              <Alert variant='outlined' sx={{mt:2,minWidth:{xs:'90%',md:400,justifyContent:'center'}}} severity='error'>{decodeURIComponent(err.replace(/\+/gim,' '))}</Alert>
            )}
          </Stack>
          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 3,
              display: { sm: 'none' }
            }}
          >
            {t("not_register")} &nbsp;<a href={`${process.env.ACCOUNT_URL}/register`}>{t("register")}</a>
          </Typography>
        </ContentStyle>
      </Container>
    </RootStyle>
  )
}

function Loginned({user}: {user:PortalnesiaUser}) {
  const router = useRouter();
  const {t} = useTranslation('dash_apps');
  const {t:tCom} = useTranslation('common');
  const [loading,setLoading] = React.useState(false);
  const [dialog,setDialog] = React.useState(false);
  const [page,setPage] = usePagination(1);
  const setNotif = useNotif();
  const {post} = useAPI()
  const [oPage,setOPage] = usePagination(1);
  const [input,setInput] = React.useState({name:'',description:''});
  const {data,error,mutate} = useSWR<Toko,true>(`/tokos?pagination[page]=${page}`);
  const {data:outlet,error:errorOutlet} = useSWR<Outlet,true>(`/outlets?pagination[page]=${oPage}`)

  const createApp=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);

    try {
      await post<{id: number,slug: string}>(`/tokos`,input);
      setPage({},1);
      mutate();
      setDialog(false);
      setNotif(tCom("saved"),false);
    } catch(e: any) {
      setNotif(e?.error?.message,true);
    } finally {
      setLoading(false);
    }
  },[input,post,setNotif,tCom])

  return (
    <Dashboard withNavbar={false} backToTop={{position:'bottom',color:'primary'}} whatsappWidget={{enabled:false}}>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="h4" component='h4' gutterBottom>{`Hai ${user?.name},`}</Typography>
              <Typography variant="h2" component='h2'>{t("owned_merchant")}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display='flex' justifyContent={'flex-end'} alignItems='flex-end'>
              <Button size='large' icon='add' onClick={()=>setDialog(true)}>{tCom("create_ctx",{what:"Merchant"})}</Button>
            </Box>
          </Grid>
        </Grid>

        {!data && !error ? (
          <Circular />
        ) : error ? (
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant="h2" component='h2'>{error?.error.message}</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {data?.data.length === 0 ? (
                <Box mb={2}>
                  <Typography variant="h4" component='h4'>{tCom("no_what",{what:"data"})}</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {data?.data.map((d,i)=>(
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
                      <Card>
                        <CardActionArea onClick={()=>router.push(`/apps/${d.slug}`)}>
                          <CardMedia>
                            <Image src={`${photoUrl(d.logo?.url||null)}`} style={{width:300,height:'auto'}} />
                          </CardMedia>
                          <CardContent>
                            <Typography>{d.name}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
            {(data?.meta?.pagination?.pageCount||1) > 1 && (
              <Grid item xs={12}>
                <Box mt={2}>
                  <Pagination page={page} count={data?.meta?.pagination?.pageCount||1} onChange={setPage} />
                </Box>
              </Grid>
            )}
            
          </Grid>
        )}
      </Container>
      <Box mt={8} mb={8}>
        <Divider />
      </Box>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box mb={2}>
              <Typography variant="h2" component='h2'>{t("managed_merchant")}</Typography>
            </Box>
          </Grid>
        </Grid>
        {!outlet && !errorOutlet ? (
          <Circular />
        ) : errorOutlet ? (
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant="h2" component='h2'>{errorOutlet?.error.message}</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {outlet?.data.length === 0 ? (
                <Box mb={2}>
                  <Typography variant="h4" component='h4'>{tCom("no_what",{what:"data"})}</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {outlet?.data.map((d,i)=>(
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
                      <Card>
                        <CardActionArea onClick={()=>router.push(`/apps/${d?.toko?.slug}/${d.id}`)}>
                          <CardContent>
                            <Typography>{d.name}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
            {(outlet?.meta?.pagination?.pageCount||1) > 1 && (
              <Grid item xs={12}>
                <Box mt={2}>
                  <Pagination page={oPage} count={outlet?.meta?.pagination?.pageCount||1} onChange={setOPage} />
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      <Dialog open={dialog} handleClose={()=>setDialog(false)}>
        <form onSubmit={createApp}>
          <DialogTitle>{tCom("create_ctx",{what:"Merchant"}).toUpperCase()}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  value={input.name}
                  onChange={(e)=>setInput({...input,name:e.target.value})}
                  label={tCom("name_ctx",{what:"Merchant"})}
                  fullWidth
                  autoFocus
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <SimpleMDE
                  noSideBySide
                  value={input.description}
                  onChange={(e)=>setInput({...input,description:e})}
                  label={tCom("description")}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' onClick={()=>setDialog(false)}>{tCom("cancel")}</Button>
            <Button icon='submit' type='submit'>{tCom("save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Backdrop open={loading} />
    </Dashboard>
  )
}

let codeLoading=false;
export default function DashboardApp() {
  const setNotif = useNotif();
  const {t} = useTranslation('dash_apps');
  const {t:tMenu} = useTranslation('menu');
  const {t:tCom} = useTranslation('common');
  const dispatch = useDispatch();
  useInitData();
  const {user,ready:loaded} = useSelector<Pick<State,'user'|'ready'>>(s=>({user:s.user,ready:s.ready}));
  const router = useRouter();
  const access_token = router.query?.access_token;
  const [features,setFeatures] = React.useState<Pick<PSysInfo,'cookieEnabled'|'support_localStorage'|'support_sessionStorage'|'support_webSocket'>|null|false>(null)

  React.useEffect(()=>{
    async function login() {
      if(typeof access_token === 'string' && !codeLoading && router.isReady) {
        codeLoading=true;
        const auth = SessionStorage.get('auth');
        SessionStorage.remove('auth')
        try {
          const token = await portalnesia.login(access_token)
          dispatch({type:"CUSTOM",payload:{user:token.user}})
          console.log(auth);
          if(auth?.pathname) {
            router.replace({pathname:auth?.pathname,query:auth?.query},auth?.asPath);
          } else {
            router.replace({pathname:router.pathname},undefined,{shallow:true});
          }
        } catch(e: any) {
          if(typeof e?.error?.message === 'string') router.replace({pathname:router.pathname,query:{error_description:encodeURIComponent(e?.error?.message)}},undefined,{shallow:true});
          setNotif(e?.error?.message||tCom("error_500"),true);
        }
      }
    }
    const system = getSysInfo();
    const {cookieEnabled,support_localStorage,support_sessionStorage,support_webSocket} = system
    let features: Pick<PSysInfo,'cookieEnabled'|'support_localStorage'|'support_sessionStorage'|'support_webSocket'>|null|false
    if(
      cookieEnabled && 
      support_localStorage && 
      support_sessionStorage && 
      support_webSocket
    ) {
      features=false;
      setFeatures(false)
    } else {
      features={cookieEnabled,support_localStorage,support_sessionStorage,support_webSocket}
      setFeatures({cookieEnabled,support_localStorage,support_sessionStorage,support_webSocket})
    }

    if(loaded && typeof access_token === 'string' && !codeLoading && router.isReady && features === false) login();
  },[access_token,router.isReady,loaded,dispatch])

  return (
    <Header title={ucwords(tMenu("dashboard"))}>
      {!router.isReady || (user===null||loaded===false) ? (
        <SplashScreen />
      ) : features === null ? (
        <RootStyle sx={{display:'flex',flexDirection:'column',minHeight:'100vh',alignItems:'center',justifyContent:'center'}}>
          <CircularProgress size={50} />
          {t("features").split("\n").map((t,i)=>(
            <Typography key={`features-wait-${i}`} sx={{mt:3}} variant={i===0 ? 'h3' : 'h4'} component={i===0 ? 'h3' : 'h4'}>{t}</Typography>
          ))}
        </RootStyle>
      ) : typeof features === 'object' ? (
        <RootStyle sx={{display:'flex',flexDirection:'column',minHeight:'100vh',alignItems:'center',justifyContent:'center'}}>
          <Typography sx={{mt:3}} variant="h3" component='h3'>{`${t("features_failed.title")}`}</Typography>
          <List component={'ol'} sx={{listStyle:'decimal',listStylePosition:'inside'}}>
            {Object.entries(features).filter(f=>f[1]===false).map((f)=>(
              <ListItem key={`features-failed-${f[0]}`} disablePadding sx={{display:'list-item'}}>{t(`features_failed.${f[0]}`)}</ListItem>
            ))}
          </List>
        </RootStyle>
      ) : typeof access_token === 'string' ? (
        <RootStyle sx={{display:'flex',flexDirection:'column',minHeight:'100vh',alignItems:'center',justifyContent:'center'}}>
          <CircularProgress size={50} />
          <Typography sx={{mt:3}} variant="h3" component='h3'>{`${tCom("wait")}...`}</Typography>
        </RootStyle>
      ) : typeof user === 'boolean' ? (
        <LoginSection />
      ) : (
        <Loginned user={user} />
      )}
      
    </Header>
  )
}
