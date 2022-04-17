// material
import { Box, Grid, Container, Typography,styled,SxProps,Theme,List,ListItem,Hidden, Stack } from '@mui/material';
import {WhatsApp,Email,Instagram,Twitter} from '@mui/icons-material'
// components
import Header from '../components/Header';
import Dashboard,{APP_BAR_DESKTOP,APP_BAR_MOBILE} from '../layout/home/index'
import React from 'react'
import Image from '@comp/Image'
import {staticProps} from '@redux/store'
import {useTranslation} from 'next-i18next';
import Lottie from '@comp/Lottie';
import Button from '@comp/Button';

export const getStaticProps = staticProps({translation:'landing'});

const MainStyles = styled('div')<{isFirst?:boolean,isLast?:boolean}>(({ theme,isFirst,isLast }) => ({
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: isLast ? theme.spacing(10) : theme.spacing(5),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}))

type SectionProps = {
  children:React.ReactNode,
  color?: string|((theme: Theme)=>string)
  isFirst?:boolean,
  isLast?:boolean
  sx?: SxProps<Theme>
}

function Section({children,color,isFirst,isLast,sx}: SectionProps) {

  return (
    <>
      {isFirst && <Box sx={{height:{xs:APP_BAR_MOBILE,lg:APP_BAR_DESKTOP},...(color ? {backgroundColor:color} : {})}} />}
      <MainStyles
        isLast={isLast}
        sx={{
          minHeight:isFirst ? {xs:`calc(100vh - ${APP_BAR_MOBILE}px)`,lg:`calc(100vh - ${APP_BAR_DESKTOP}px)`} : '100vh',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          ...(color ? {backgroundColor:color} : {}),
          ...sx
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
        
      </MainStyles>
    </>
  )
}

export default function DashboardApp() {
  const {t: tMenu} = useTranslation('menu');
  const {t} = useTranslation('landing')

  return (
    <Header title={tMenu("home")}>
      <Dashboard withPadding={false}>
        <Section color='primary.lighter' isFirst sx={{color:'#000',backgroundImage:'url("/static/illustrations/cashier.webp")',backgroundRepeat:'no-repeat',backgroundPositionY:{xs:'top',md:'center'},backgroundPositionX:'right',backgroundBlendMode:'multiply',backgroundSize:{xs:'contain',md:'auto'}}}>
          <Box>
            <Typography variant="h2" component='h2'>{t("section1.start")}</Typography>
            <Typography variant='h2' component='h2'> {t("section1.with")} <Typography component='span' variant='h2' sx={{color:'primary.main'}}>SansOrder</Typography></Typography>
          </Box>
          <Box mt={5}>
            <Typography>{t("section1.desc")}</Typography>
          </Box>
        </Section>
        <Section sx={{alignItems:'flex-start'}}>
          <Box mb={4} textAlign='center'>
            <Typography variant='h2' component='h2'>{t("section2.start",{name:"Sans Order"})}</Typography>
          </Box>
          <Grid container spacing={6} justifyContent='center'>
            <Grid item xs={12} lg={10}>
              <Grid container spacing={2} justifyContent='center' alignItems='center'>
                <Grid item xs={12} sm={6}>
                  <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie sx={{mb:2,width:350}} animation={'order'} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>{t("section2.desc1")}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={10}>
              <Grid container spacing={2} justifyContent='center' alignItems='center'>
                <Hidden smDown>
                  <Grid item xs={12} sm={6}>
                    <Typography>{t("section2.desc2")}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie sx={{mb:2,width:350}} animation={'order-confirm'} /></Box>
                  </Grid>
                </Hidden>
                <Hidden smUp>
                  <Grid item xs={12} sm={6}>
                    <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie sx={{mb:2,width:350}} animation={'order-confirm'} /></Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography>{t("section2.desc2")}</Typography>
                  </Grid>
                </Hidden>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={10}>
              <Grid container spacing={2} justifyContent='center' alignItems='center'>
                <Grid item xs={12} sm={6}>
                  <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie sx={{width:350}} animation={'system'} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>{t("section2.desc3.title")}</Typography>
                  <List component={'ul'} sx={{listStyle:'circle',listStylePosition:'inside'}}>
                    {t("section2.desc3.list").split("\n").map((t,i)=>(
                      <ListItem key={`desc3-${i}`} disablePadding sx={{display:'list-item'}}>{t}</ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Section>
        <Section color={'secondary.lighter'} sx={{color:'#000'}}>
          <Box mb={4} textAlign='center'>
            <Typography variant='h2' component='h2'>{t("features",{what:"Sans Order"})}</Typography>
          </Box>
          <Grid container spacing={4} justifyContent='center'>
            <Grid item xs={12} sm={6}>
              <Box mb={4} textAlign={{xs:'left',sm:'center'}} display='flex' justifyContent='center' flexDirection='column'>
                <Image src={'/static/Website.png'} sx={{maxWidth:120,ml:'auto',mr:'auto',mb:2}} />
                <Typography variant='h4' component='h4' gutterBottom>Website</Typography>
                <Typography>Tes</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={4} textAlign={{xs:'left',sm:'center'}} display='flex' justifyContent='center' flexDirection='column'>
                <Image src={'/static/Online-Payment.png'} sx={{maxWidth:100,ml:'auto',mr:'auto',mb:2}} />
                <Typography variant='h4' component='h4' gutterBottom>{t("section3.payment")}</Typography>
                <Typography>{t("section3.payment",{context:"desc"})}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={4} textAlign={{xs:'left',sm:'center'}} display='flex' justifyContent='center' flexDirection='column'>
                <Image src={'/static/Invoice.png'} sx={{maxWidth:120,ml:'auto',mr:'auto',mb:2}} />
                <Typography variant='h4' component='h4' gutterBottom>{t("section3.invoice.title")}</Typography>
                <Typography>{t("section3.invoice.desc")}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={4} textAlign={{xs:'left',sm:'center'}} display='flex' justifyContent='center' flexDirection='column'>
                <Image src={'/static/Marketing.png'} sx={{maxWidth:120,ml:'auto',mr:'auto',mb:2}} />
                <Typography variant='h4' component='h4' gutterBottom>Marketing</Typography>
                <Typography>Tes</Typography>
              </Box>
            </Grid>
          </Grid>
        </Section>
        <Section>
          <Box mb={8} textAlign='center' display='flex' justifyContent='center'>
            <Typography variant='h2' component='h2'>{tMenu("contact_us")}</Typography>
          </Box>
          <Grid container spacing={2} justifyContent='center'>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction='row' spacing={2} alignItems='center' justifyContent={{xs:'flex-start',md:'center'}}>
                <Email />
                <Typography>support@portalnesia.com</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction='row' spacing={2} alignItems='center' justifyContent={{xs:'flex-start',md:'center'}}>
                <WhatsApp />
                <Typography>+628123456789</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction='row' spacing={2} alignItems='center' justifyContent={{xs:'flex-start',md:'center'}}>
                <Instagram />
                <Typography>@portalnesia.id</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction='row' spacing={2} alignItems='center' justifyContent={{xs:'flex-start',md:'center'}}>
                <Twitter />
                <Typography>@Portalnesia1</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box mt={8} display='flex'  justifyContent='center'>
            <Button>{tMenu("contact")}</Button>
          </Box>
        </Section>
      </Dashboard>
    </Header>
  )
}
