import {Box,CircularProgress} from '@mui/material'

export function Circular() {

  return (
    <Box display='flex' flexGrow='1' alignItems='center' justifyContent='center'>
      <CircularProgress size={50} />
    </Box>
  )
}