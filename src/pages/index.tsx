// material
import { Box, Grid, Container, Typography,styled,SxProps,Theme } from '@mui/material';
// components
import Header from '../components/Header';
import Dashboard,{APP_BAR_DESKTOP,APP_BAR_MOBILE} from '../layout/home/index'
import React from 'react'
import Image from '@comp/Image'
import {staticProps} from '@redux/store'
import {useTranslations} from 'next-intl';


export const getStaticProps = staticProps();

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
  color?: string
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
  const t = useTranslations();

  React.useEffect(()=>{
    console.log("NOW",Math.floor(new Date().getTime()/1000))
  },[])
  
  return (
    <Header title={t("Menu.home")}>
      <Dashboard withPadding={false}>
        <Section color='primary.lighter' isFirst sx={{backgroundImage:'url("/static/illustrations/cashier.webp")',backgroundRepeat:'no-repeat',backgroundPositionY:{xs:'top',md:'center'},backgroundPositionX:'right',backgroundBlendMode:'multiply',backgroundSize:{xs:'contain',md:'auto'}}}>
          <Box>
            <Typography variant="h2" component='h2'>{t("Landing.section1.start")}</Typography>
            <Typography variant='h2' component='h2'> {t("Landing.section1.with")} <Typography component='span' variant='h2' sx={{color:'primary.main'}}>Sans Order</Typography></Typography>
          </Box>
          <Box mt={5}>
            <Typography>{t("Landing.section1.desc")}</Typography>
          </Box>
        </Section>
        <Section sx={{alignItems:'flex-start'}}>
          <Box textAlign='center'>
            <Typography variant='h2' component='h2'>{t("Landing.section2.start",{name:"Sans Order"})}</Typography>
          </Box>
        </Section>
      </Dashboard>
    </Header>
  )
}
