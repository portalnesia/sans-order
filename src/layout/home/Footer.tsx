import {Box,styled,Grid,Typography} from '@mui/material'
import Logo from '@comp/Logo'
import {MenuItem,FooterRoot,FooterMenu,FooterChild} from '../dashboard/DashboardSidebar'
import footerMenu from '@layout/FooterConfig'
import { useTranslation } from 'next-i18next'

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
}))

export default function Footer() {
  const {t} = useTranslation('menu');
  
  return (
    <BoxStyle>
      
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' pt={2} pb={2}>
        <Logo />
        <Box mt={2}>
          <FooterRoot sx={{mb:1}}>
            <FooterMenu>
              {footerMenu(t).map((f)=>(
                <MenuItem key={f.name} data={f} />
              ))}
            </FooterMenu>
          </FooterRoot>
        </Box>
        <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
          <FooterRoot sx={{mb:0}}>
            <FooterMenu>
              <FooterChild sx={{textAlign:'center'}}>
                <span {...({"xmlns:cc":"http://creativecommons.org/ns#","xmlns:dct":"http://purl.org/dc/terms/"})}>
                  <a property="dct:title" rel="cc:attributionURL" href={process.env.URL}>SansOrder</a> © {(new Date().getFullYear())}
                </span>
              </FooterChild>
              <FooterChild sx={{textAlign:'center'}}><span>Powered by <a target='_blank' href={process.env.PORTAL_URL}>Portalnesia</a></span></FooterChild>
            </FooterMenu>
          </FooterRoot>
        </Box>
      </Box>
    </BoxStyle>
  )
}