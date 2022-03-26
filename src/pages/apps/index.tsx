// material
import { Box, Grid, Container, Typography,styled,CardContent,CardActionArea,Card,Stack,Alert,CircularProgress, CardMedia } from '@mui/material';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import AuthLayout from '@layout/AuthLayout'
import React from 'react'
import Image from '@comp/Image'
import {staticProps,useSelector,State,useDispatch} from '@redux/index'
import {useTranslations} from 'next-intl';
import Button from '@comp/Button'
import loadingImage from '@comp/loading-image-base64'
import useInitData from '@utils/init-data'
import {useRouter} from 'next/router'
import portalnesia,{ResponsePagination} from '@utils/portalnesia'
import SessionStorage from "@utils/local-storage";
import useNotif from '@utils/notification'
import useSWR from '@utils/swr'
import Backdrop from '@comp/Backdrop'
import {ucwords} from '@portalnesia/utils'
import cookie from 'js-cookie'
import {getDayJs} from '@utils/Main'

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
    SessionStorage.set('pkce',code);

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

function Loginned() {
  const router = useRouter();
  const t = useTranslations();
  const {data,error} = useSWR<ResponsePagination<{name: string,slug: string,logo: string}>>("/toko?per_page=50",{
    shouldRetryOnError:(e)=>(e?.code !== 600),
  });

  return (
    <Dashboard withNavbar={false}>
      <Container maxWidth="lg">
        {!data && !error ? (
          <Backdrop open />
        ) : error && (!error?.code || error.code !== 600) ? (
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Typography variant="h2" component='h2'>{error?.message}</Typography>
          </Box>
        ) : error ? (
          <Grid container justifyContent='center' spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h2" component='h2'>{t("Subcribe.title")}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>Blablablabla Blablabla Blablabla</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>Blablablabla Blablabla Blablabla</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>Blablablabla Blablabla Blablabla</Typography>
            </Grid>
            <Grid item xs={12}>
              <Button size="large" onClick={()=>router.push("/pricing")}>{t("Subcribe.subcribe_now")}</Button>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box mb={2}>
                <Typography variant="h2" component='h2'>Business</Typography>
              </Box>
            </Grid>
            {data?.data.map((d,i)=>(
              <Grid item xs={12} sm={6} md={4} lg={3} key={`merchant-${i}`}>
                <Card>
                  <CardActionArea>
                    <CardMedia>
                      <Image src={`${d.logo}&watermark=no&export=banner&size=300&no_twibbon=true`} style={{width:'100%',height:'auto'}} />
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
      </Container>
    </Dashboard>
  )
}

export default function DashboardApp() {
  const setNotif = useNotif();
  const t = useTranslations();
  const dispatch = useDispatch();
  const {loaded} = useInitData();
  const user = useSelector<State['user']>(s=>s.user);
  const router = useRouter();
  const code = router.query?.code;

  React.useEffect(()=>{
    async function login() {
      if(typeof code === 'string') {
        const pkce = SessionStorage.get('pkce');
        if(pkce) {
          try {
            const token = await portalnesia.oauth.getToken({grant_type:'authorization_code',code,code_verifier:pkce.code_verifier});
            if(token.token.id_token) {
              const user = await portalnesia.oauth.verifyIdToken(token.token.id_token) as any
              if(user.sub) user.sub = Number.parseInt(user.sub);
              // @ts-ignore
              if(user) dispatch({type:"CUSTOM",payload:{user}})
            }
            cookie.set("_so_token_",token.token.access_token,{
              expires:getDayJs(token.token.expiredAt).toDate()
            })
            SessionStorage.set('sans_token',token.token);
            SessionStorage.remove('pkce');
            router.replace(router.route,undefined,{shallow:true});
          } catch(e: any) {
            router.replace(`${router.route}?error_description=${e?.message}`,undefined,{shallow:true});
            setNotif(e?.message||t("General.error"),true);
          }
        }
      }
    }

    if(typeof code === 'string') login();
  },[code])

  return (
    <Header title={ucwords(t("Menu.dashboard"))}>
      {!router.isReady || (typeof user === 'undefined'||loaded===false) ? (
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
        <Loginned />
      )}
      
    </Header>
  )
}
