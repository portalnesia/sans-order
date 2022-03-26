import {Box,styled,Grid,Typography} from '@mui/material'
import Logo from '@comp/Logo'

const BoxStyle = styled(Box)(({theme})=>({
  backgroundColor:theme.palette.grey[200],
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

  return (
    <BoxStyle>
      <Grid container>
        <Grid item xs={12} md={6}>

        </Grid>

      </Grid>
      <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' pt={2} pb={2}>
        <Logo />
        <Box mt={2} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
          <Typography variant='body2'>© All rights reserved</Typography>
          <Typography variant='body2'>Powered by <a target='_blank' href='https://portalnesia.com'>Portalnesia</a></Typography>
        </Box>
      </Box>
    </BoxStyle>
  )
}