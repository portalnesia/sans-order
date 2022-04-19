// material
import { Box, Grid, Container, Typography,styled,CardContent,CardActionArea,Card,Stack,Alert, CardMedia, Divider,CircularProgress } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import AuthLayout from '@layout/AuthLayout'
import React from 'react'
import Image from '@comp/Image'
import Pagination,{usePagination} from '@comp/Pagination'
import {staticProps,useSelector,State,useDispatch, IUser} from '@redux/index'
import {useTranslations} from 'next-intl';
import Button from '@comp/Button'
import loadingImage from '@comp/loading-image-base64'
import {useRouter} from 'next/router'
import portalnesia,{ResponsePagination,useAPI} from '@utils/portalnesia'
import LocalStorage from "@utils/local-storage";
import SessionStorage from '@utils/session-storage';
import useNotif from '@utils/notification'
import useSWR from '@utils/swr'
import Backdrop from '@comp/Backdrop'
import {ucwords} from '@portalnesia/utils'
import cookie from 'js-cookie'
import {getDayJs,photoUrl} from '@utils/Main'
import {Circular} from '@comp/Loading'
import useInitData from '@utils/init-data'
import {IToko,IOutletPagination} from '@type/index'
import Recaptcha from '@comp/Recaptcha'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@comp/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const TextField=dynamic(()=>import('@mui/material/TextField'))
const SimpleMDE = dynamic(()=>import('@comp/SimpleMDE'),{ssr:false})

export const getStaticProps = staticProps();

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
  const t = useTranslations();
  const router = useRouter();
  const err = router.query?.error_description;

  const login = React.useCallback(()=>{
    const code = portalnesia.oauth.generatePKCE();
    LocalStorage.set('pkce',code);

    const url = portalnesia.oauth.getAuthorizationUrl({code_challenge:code.code_challenge});
    
    window.location.href = url;
  },[])

  return (
    <RootStyle>
      <AuthLayout>
        {t("Login.not_register")} &nbsp;<a href={`${process.env.ACCOUNT_URL}/register`}>{t("Login.register")}</a>
      </AuthLayout>

      <SectionStyle sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
          {t("Login.hi")}
        </Typography>
        <Image src="/static/illustrations/illustration_login.png" alt="Login" />
      </SectionStyle>

      <Container maxWidth="sm">
        <ContentStyle>
          <Stack sx={{ mb: 5,alignItems:'center' }}>
            <Typography variant="h4" gutterBottom>
              {t("Login.signin")}
            </Typography>
            <Button onClick={login} sx={{mt:3,backgroundColor:'#2f6f4e !important'}} size="large" startIcon={<Image src="/icon/android-icon-48x48.png" width={25} />}>{t("Login.sign")}</Button>
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
            {t("Login.not_register")} &nbsp;<a href={`${process.env.ACCOUNT_URL}/register`}>{t("Login.register")}</a>
          </Typography>
        </ContentStyle>
      </Container>
    </RootStyle>
  )
}

function Loginned({user}: {user:IUser}) {
  const router = useRouter();
  const t = useTranslations();
  const [loading,setLoading] = React.useState(false);
  const [dialog,setDialog] = React.useState(false);
  const [page,setPage] = usePagination(1);
  const setNotif = useNotif();
  const {post} = useAPI()
  const [oPage,setOPage] = usePagination(1);
  const [input,setInput] = React.useState({name:'',description:''});
  const {data,error,mutate} = useSWR<ResponsePagination<IToko>>(`/toko?page=${page}&per_page=12&type=toko`);
  const {data:outlet,error:errorOutlet} = useSWR<ResponsePagination<IOutletPagination>>(`/toko?page=${oPage}&per_page=12&type=outlet`)
  const captchaRef = React.useRef<Recaptcha>(null);

  const createApp=React.useCallback(async(e?: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    setLoading(true);

    try {
      const recaptcha = await captchaRef.current?.execute();
      await post<{id: number,slug: string}>(`/toko`,{...input,recaptcha});
      setPage({},1);
      mutate();
      setDialog(false);
      setNotif(t("General.saved"),false);
    } catch(e: any) {
      setNotif(e?.message,true);
    } finally {
      setLoading(false);
    }
  },[input,post,setNotif,t])

  return (
    <Dashboard withNavbar={false}>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="h4" component='h4' gutterBottom>{`Hai ${user?.name},`}</Typography>
              <Typography variant="h2" component='h2'>{t("Login.owned_merchant")}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display='flex' justifyContent={'flex-end'} alignItems='flex-end'>
              <Button size='large' icon='add' onClick={()=>setDialog(true)}>{t("General.create",{what:"Merchant"})}</Button>
            </Box>
          </Grid>
        </Grid>

        {!data && !error ? (
          <Circular />
        ) : error ? (
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant="h2" component='h2'>{error?.message}</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {data?.data.length === 0 ? (
                <Box mb={2}>
                  <Typography variant="h4" component='h4'>{t("General.no",{what:"data"})}</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {data?.data.map((d,i)=>(
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
                      <Card>
                        <CardActionArea onClick={()=>router.push(`/apps/${d.slug}`)}>
                          <CardMedia>
                            <Image src={`${photoUrl(d.logo)}&watermark=no&export=banner&size=300&no_twibbon=true`} style={{width:'100%',height:'auto'}} />
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
            {(data?.total_page||1) > 1 && (
              <Grid item xs={12}>
                <Box mt={2}>
                  <Pagination page={page} count={data?.total_page||1} onChange={setPage} />
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
              <Typography variant="h2" component='h2'>{t("Login.managed_merchant")}</Typography>
            </Box>
          </Grid>
        </Grid>
        {!outlet && !errorOutlet ? (
          <Circular />
        ) : errorOutlet ? (
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant="h2" component='h2'>{errorOutlet?.message}</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {outlet?.data.length === 0 ? (
                <Box mb={2}>
                  <Typography variant="h4" component='h4'>{t("General.no",{what:"data"})}</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {outlet?.data.map((d,i)=>(
                    <Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
                      <Card>
                        <CardActionArea onClick={()=>router.push(`/apps/${d.toko.slug}/${d.id}`)}>
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
            {(outlet?.total_page||1) > 1 && (
              <Grid item xs={12}>
                <Box mt={2}>
                  <Pagination page={oPage} count={outlet?.total_page||1} onChange={setOPage} />
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      <Dialog open={dialog} handleClose={()=>setDialog(false)}>
        <form onSubmit={createApp}>
          <DialogTitle>{t("General.create",{what:"Merchant"}).toUpperCase()}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  value={input.name}
                  onChange={(e)=>setInput({...input,name:e.target.value})}
                  label={t("General.name",{what:"Merchant"})}
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
                  label={t("General.description")}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button text color='inherit' onClick={()=>setDialog(false)}>{t("General.cancel")}</Button>
            <Button icon='submit' type='submit'>{t("General.save")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Recaptcha ref={captchaRef} />
      <Backdrop open={loading} />
    </Dashboard>
  )
}

export default function DashboardApp() {
  const setNotif = useNotif();
  const t = useTranslations();
  const dispatch = useDispatch();
  useInitData();
  const {user,ready:loaded} = useSelector<Pick<State,'user'|'ready'>>(s=>({user:s.user,ready:s.ready}));
  const router = useRouter();
  const code = router.query?.code;

  React.useEffect(()=>{
    async function login() {
      if(typeof code === 'string') {
        const pkce = LocalStorage.get('pkce');
        const auth = SessionStorage.get('auth')
        if(pkce) {
          try {
            const token = await portalnesia.oauth.getToken({grant_type:'authorization_code',code,code_verifier:pkce.code_verifier});
            if(token.token.id_token) {
              const user = await portalnesia.oauth.verifyIdToken(token.token.id_token) as any
              if(user.sub) user.sub = Number.parseInt(user.sub);
              // @ts-ignore
              if(user) {
                cookie.set("_so_token_",`${user?.sub}`,{
                  expires:getDayJs().add(1,'month').toDate()
                })
                dispatch({type:"CUSTOM",payload:{user}})
              }
            }
            
            LocalStorage.set('sans_token',token.token);
            LocalStorage.remove('pkce');
            if(auth?.pathname) {
              router.replace({pathname:auth?.pathname,query:auth?.query},auth?.asPath);
            } else {
              router.replace({pathname:router.pathname},undefined,{shallow:true});
            }
          } catch(e: any) {
            router.replace({pathname:router.pathname,query:{error_description:e?.message}},undefined,{shallow:true});
            setNotif(e?.message||t("General.error"),true);
          }
        }
      }
    }

    if(typeof code === 'string') login();
  },[code])

  return (
    <Header title={ucwords(t("Menu.dashboard"))}>
      {!router.isReady || (user===null||loaded===false) ? (
        <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
          <img style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
        </div>
      ) : typeof code === 'string' ? (
        <RootStyle sx={{display:'flex',flexDirection:'column',minHeight:'100vh',alignItems:'center',justifyContent:'center'}}>
          <CircularProgress size={50} />
          <Typography sx={{mt:3}} variant="h3" component='h3'>{`${t("General.wait")}...`}</Typography>
        </RootStyle>
      ) : typeof user === 'boolean' ? (
        <LoginSection />
      ) : (
        <Loginned user={user} />
      )}
      
    </Header>
  )
}
