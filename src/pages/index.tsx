// material
import { Box, Grid, Container, Typography,styled,SxProps,Theme,List,ListItem,Hidden, Stack } from '@mui/material';
import {WhatsApp,Email,Instagram,Facebook} from '@mui/icons-material'
// components
import Header from '../components/Header';
import Dashboard,{APP_BAR_DESKTOP,APP_BAR_MOBILE} from '../layout/home/index'
import React from 'react'
import Image from '@comp/Image'
import {staticProps} from '@redux/store'
import {useTranslation} from 'next-i18next';
import Lottie from '@comp/Lottie';
import config from '@root/web.config.json'

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
            <Typography variant='h2' component='h2'> {t("section1.with")} <Typography component='span' variant='h2' sx={{color:'primary.main'}}>{config.title}</Typography></Typography>
          </Box>
          <Box mt={5}>
            <Typography>{t("section1.desc")}</Typography>
          </Box>
        </Section>
        <Section>
          <Box mb={4} textAlign='center'>
            <Typography variant='h2' component='h2'>{t("section2.title")}</Typography>
          </Box>
          <Box textAlign={{xs:'left',sm:'center'}}>
            <Typography>{t("section2.desc")}</Typography>
          </Box>
          <Box mt={6}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box justifyContent='center' alignItems='center' display={{xs:'block',md:'flex'}} flexDirection='column'>
                  <Typography variant='h4' component='h4'>{t("section2.target.title")}</Typography>
                  <List component={'ol'} sx={{listStyle:'circle',listStylePosition:'inside'}}>
                    {t("section2.target.list",{joinArrays:"\n"}).split("\n").map((k,i)=>(
                      <ListItem key={`cod-${i}`} disablePadding sx={{display:'list-item'}}>{k}</ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box justifyContent='center' alignItems='center' display={{xs:'block',md:'flex'}} flexDirection='column'>
                <Typography variant='h4' component='h4'>{t("section2.services.title")}</Typography>
                  <List component={'ol'} sx={{listStyle:'circle',listStylePosition:'inside'}}>
                    {t("section2.services.list",{joinArrays:"\n"}).split("\n").map((k,i)=>(
                      <ListItem key={`cod-${i}`} disablePadding sx={{display:'list-item'}}>{k}</ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Section>
        <Section sx={{alignItems:'flex-start'}}>
          <Box mb={10} textAlign='center'>
            <Typography variant='h2' component='h2'>{t("section3.start",{name:config.title})}</Typography>
          </Box>
          <Grid container spacing={4} justifyContent='center'>
            <Grid item xs={12} lg={10}>
              <Grid container spacing={2} justifyContent='center' alignItems='center'>
                <Grid item xs={12} sm={6}>
                  <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie sx={{mb:2,width:250}} animation={'design'} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom variant='h6' component='h6'>{t("section3.feature.design.title")}</Typography>
                  <Typography>{t("section3.feature.design.desc")}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={10}>
              <Grid container spacing={2} justifyContent='center' alignItems='center'>
                <Hidden smDown>
                  <Grid item xs={12} sm={6}>
                    <Typography gutterBottom variant='h6' component='h6'>{t("section3.feature.report.title")}</Typography>
                    <Typography>{t("section3.feature.report.desc")}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie sx={{mb:2,width:350}} animation={'report'} /></Box>
                  </Grid>
                </Hidden>
                <Hidden smUp>
                  <Grid item xs={12} sm={6}>
                    <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie sx={{mb:2,width:350}} animation={'report'} /></Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography gutterBottom variant='h6' component='h6'>{t("section3.feature.report.title")}</Typography>
                    <Typography>{t("section3.feature.report.desc")}</Typography>
                  </Grid>
                </Hidden>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={10}>
              <Grid container spacing={2} justifyContent='center' alignItems='center'>
                <Grid item xs={12} sm={6}>
                  <Box display='flex' justifyContent={'center'} alignItems='center'><Lottie sx={{mb:2,width:350}} animation={'order'} /></Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom variant='h6' component='h6'>{t("section3.feature.automatic.title")}</Typography>
                  <Typography>{t("section3.feature.automatic.desc")}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Section>
        <Section>
          <Box mb={4} textAlign='center'>
            <Typography variant='h2' component='h2'>{t("features",{what:config.title})}</Typography>
          </Box>
          <Grid container spacing={4} justifyContent='center'>
            <Grid item xs={12} sm={6}>
              <Box mb={4} textAlign={{xs:'left',sm:'center'}} display='flex' justifyContent='center' flexDirection='column'>
                <Image src={'/static/Website.png'} sx={{maxWidth:120,ml:'auto',mr:'auto',mb:2}} />
                <Typography variant='h4' component='h4' gutterBottom>{t('section4.website.title')}</Typography>
                <Typography>{t('section4.website.desc')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={4} textAlign={{xs:'left',sm:'center'}} display='flex' justifyContent='center' flexDirection='column'>
                <Image src={'/static/Online-Payment.png'} sx={{maxWidth:100,ml:'auto',mr:'auto',mb:2}} />
                <Typography variant='h4' component='h4' gutterBottom>{t("section4.payment.title")}</Typography>
                <Typography>{t("section4.payment.desc")}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={4} textAlign={{xs:'left',sm:'center'}} display='flex' justifyContent='center' flexDirection='column'>
                <Image src={'/static/Invoice.png'} sx={{maxWidth:120,ml:'auto',mr:'auto',mb:2}} />
                <Typography variant='h4' component='h4' gutterBottom>{t("section4.invoice.title")}</Typography>
                <Typography>{t("section4.invoice.desc")}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={4} textAlign={{xs:'left',sm:'center'}} display='flex' justifyContent='center' flexDirection='column'>
                <Image src={'/static/Marketing.png'} sx={{maxWidth:120,ml:'auto',mr:'auto',mb:2}} />
                <Typography variant='h4' component='h4' gutterBottom>{t('section4.report.title')}</Typography>
                <Typography>{t('section4.report.desc')}</Typography>
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
                <a href={`mailto:${config.contact.email}`}><Typography sx={{color:'text.primary'}}>{config.contact.email}</Typography></a>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction='row' spacing={2} alignItems='center' justifyContent={{xs:'flex-start',md:'center'}}>
                <WhatsApp />
                <a href={`${process.env.NEXT_PUBLIC_URL}/wa`} target="_blank" rel="nofollow noopener noreferrer"><Typography sx={{color:'text.primary'}}>{config.contact.whatsapp}</Typography></a>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction='row' spacing={2} alignItems='center' justifyContent={{xs:'flex-start',md:'center'}}>
                <Instagram />
                <a href={`${process.env.NEXT_PUBLIC_URL}/ig`} target="_blank" rel="nofollow noopener noreferrer"><Typography sx={{color:'text.primary'}}>{config.contact.instagram}</Typography></a>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction='row' spacing={2} alignItems='center' justifyContent={{xs:'flex-start',md:'center'}}>
                <Facebook />
                <a href={`${process.env.NEXT_PUBLIC_URL}/fb`} target="_blank" rel="nofollow noopener noreferrer"><Typography sx={{color:'text.primary'}}>{config.contact.facebook.name}</Typography></a>
              </Stack>
            </Grid>
          </Grid>
        </Section>
      </Dashboard>
    </Header>
  )
}
