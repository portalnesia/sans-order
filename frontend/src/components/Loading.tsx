import {Box,CircularProgress, CircularProgressProps} from '@mui/material'

export function Circular(props: CircularProgressProps) {

  return (
    <Box display='flex' flexGrow='1' alignItems='center' justifyContent='center'>
      <CircularProgress size={50} {...props} />
    </Box>
  )
}