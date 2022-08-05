import {Box,styled,Grid,Typography, Container, Stack, Hidden} from '@mui/material'
import Logo from '@comp/Logo'
import {MenuItem,FooterRoot,FooterMenu,FooterChild} from '../dashboard/DashboardSidebar'
import {footerMenu} from '@layout/FooterConfig'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import config from '@root/web.config.json'
import useResponsive from '@comp/useResponsive'
import {version} from '@root/src/version'
import { useMemo } from 'react'

const BoxStyle = styled(Box)(({theme})=>({
  backgroundColor:theme.palette.background.default,
  WebkitBoxAlign:'stretch',
  WebkitBoxDirection:'normal',
  WebkitBoxOrient:'vertical',
  WebkitFlexBasis:'auto',
  WebkitFlexDirection:'column',
  WebkitFlexShrink:0,
  alignItems:'stretch',
  boxSizing:'border-box',
  display:'flex',
  flexBasis:'auto',
  flexDirection:'column',
  flexShrink:0,
  margin:0,
  marginBottom:15,
  padding:0,
  position:'relative',
  zIndex:0,
  justifyContent:'center',
  '& a:hover':{
    textDecoration:'underline'
  },
}))

function FooterLogo({xs}: {xs?:boolean}) {
  return (
    <Stack direction='row' spacing={2} {...(xs ? {} : {justifyContent:'center',alignItems:'center'})}>
      <Logo />
      <Box>
        <Link href={`/`} passHref><a style={{textDecoration:'none'}}>
          <Typography variant='h4' sx={{color: 'text.primary'}}>{config.title}</Typography>
          <Typography component='span' sx={{color: 'text.secondary',fontSize:14}}>{config.tagline}</Typography>
        </a></Link>
      </Box>
    </Stack>
  )
}

function FooterCopyright({xs}: {xs?:boolean}) {
  return (
    <Box display='flex' flexDirection='column' {...(xs ? {} : {justifyContent:'center',alignItems:'center'})}>
      <FooterRoot sx={{mb:0}}>
        <FooterMenu sx={{p:0,px:0}}>
          <FooterChild {...(xs ? {} : {sx:{textAlign:'center'}})}>
            <span {...({"xmlns:cc":"http://creativecommons.org/ns#","xmlns:dct":"http://purl.org/dc/terms/"})}>
              <Link href='/' passHref><a property="dct:title" rel="cc:attributionURL">SansOrder</a></Link> © {(new Date().getFullYear())}. v{version}
            </span>
          </FooterChild>
          <FooterChild {...(xs ? {} : {sx:{textAlign:'center'}})}><span>Powered by <a target='_blank' rel='noreferrer noopener' href={process.env.NEXT_PUBLIC_PORTAL_URL}>Portalnesia</a></span></FooterChild>
        </FooterMenu>
      </FooterRoot>
    </Box>
  )
}

function XsFooter() {
  const {t} = useTranslation('menu');
  const footer = useMemo(()=>footerMenu(t),[t]);
  const sm = useMemo(()=>footer.length === 3 ? 4 : 6,[footer])
  return (
    <Box display='flex' flexDirection='column' pt={2} pb={2}>
      <FooterLogo xs />
      <Box mt={4} width='100%'>
        <Box mb={2}>
          <Grid container spacing={4}>
            {footer.map((f)=>(
              <Grid item key={f.header} xs={12} sm={sm}>
                <Box display='flex' flexDirection='column' alignItems='flex-start'>
                  <Typography sx={{color:'text.secondary',fontSize:14,mb:1,borderBottom:t=>`1px solid ${t.palette.divider}`}}>{f.header}</Typography>
                  {f.child?.map((c)=>(
                    <MenuItem home sx={{color:'text.primary'}} spanSx={{fontSize:15}} key={c.name} data={c} />
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <FooterCopyright xs />
    </Box>
  )
}

function SmFooter() {
  const {t} = useTranslation('menu');
  const isMd = useResponsive('up','md');
  const footer = useMemo(()=>footerMenu(t),[t]);
  const sm = useMemo(()=>{
    if(footer.length === 3) {
      return isMd ? 3 : 4
    } else {
      return isMd ? 4 : 6
    }
  },[footer,isMd])
  return (
    <Box display='flex' flexDirection='column' pt={2} pb={2}>
      <Hidden mdUp>
        <FooterLogo />
      </Hidden>
      <Box my={4} width='100%'>
        <Grid container spacing={2}>
          <Hidden mdDown>
            <Grid item key={'footer-logo'} xs={12} sm={footer.length === 3 ? 3 : 4}>
              <FooterLogo />
            </Grid>
          </Hidden>
          {footer.map((f)=>(
            <Grid item key={f.header} xs={12} sm={sm}>
              <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                <Typography sx={{color:'text.secondary',fontSize:14,mb:1,borderBottom:t=>`1px solid ${t.palette.divider}`}}>{f.header}</Typography>
                {f.child?.map((c)=>(
                  <MenuItem home sx={{color:'text.primary'}} spanSx={{fontSize:15}} key={c.name} data={c} />
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <FooterCopyright />
    </Box>
  )
}

export default function Footer() {
  
  return (
    <BoxStyle>
      <Container>
        <Hidden smUp><XsFooter /></Hidden>
        <Hidden smDown><SmFooter /></Hidden>
      </Container>
    </BoxStyle>
  )
}