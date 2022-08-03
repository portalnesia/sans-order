// material
import { Box, Grid, Container, Typography,Card, CardActionArea, CardContent, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// components
import Header from '@comp/Header';
import Dashboard from '@layout/home/index'
import React from 'react'
import {staticProps} from '@redux/store'
import {useTranslation} from 'next-i18next';
import Iconify from '@comp/Iconify'
import Link from 'next/link'

type IIndex = {title: string,link: string,icon:'string'}
type IPages = {
  meta: {
    index: IIndex[]
  }
}

const CAArea = styled(CardActionArea)<{component?: string}>(()=>({}))

export const getStaticProps = staticProps(async({getTranslation,locale})=>{
  const bhs = locale||'en';
  return {
    props: {
      meta: {
        index:[{
          title:'contact_us',
          link:'/help/contact',
          icon:'healthicons:contact-support'
        },{
          title:'faq',
          link:'/help/faq',
          icon:'wpf:faq'
        },{
          title:'payment_tutorial',
          link:'help/payment',
          icon:'fluent:payment-16-filled'
        }]
      },
      ...(await getTranslation('pages',bhs))
    }
  }
});

export default function HelpIndex({meta}: IPages) {
  const {t:tMenu} = useTranslation('menu');
  
  return (
    <Header title={tMenu('help')}>
      <Dashboard>
        <Container>
          <Box textAlign='center' mb={8}>
            <Typography variant='h1' component='h1'>{tMenu("help")}</Typography>
          </Box>
          <Grid container spacing={2}>
            {meta?.index?.map((m,i)=>(
              <Grid key={m.title} item xs={12} sm={6} md={4}>
                <Card sx={{height:'100%'}}>
                  <Link href={m.link} passHref><CAArea component='a' sx={{height:'100%',display:'flex',justifyContent:'center'}}>
                    <CardContent>
                      <Stack spacing={2} justifyContent='center' alignItems='center'>
                        <Iconify icon={m.icon} width={50} height={50} />
                        <Typography variant='h4' component='h4'>{tMenu(m.title)}</Typography>
                      </Stack>
                    </CardContent>
                  </CAArea></Link>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Dashboard>
    </Header>
  )
}