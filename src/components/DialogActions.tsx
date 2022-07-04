import {useEffect, useMemo,useRef,useState} from 'react'
import {DialogActions as Dialogg,DialogActionsProps as Props,Theme,useMediaQuery,Stack,Box} from '@mui/material'

export interface DialogActionsProps extends Props {
  fixed?: boolean
}

export default function DialogActions({fixed,children,...rest}: DialogActionsProps) {
  const sm = useMediaQuery((t: Theme)=>t.breakpoints.down('sm'));

  const isFixed = useMemo(()=>{
    if(fixed) return fixed;
    return sm;
  },[sm,fixed])

  if(!isFixed) return <Dialogg {...rest} children={children} />
  return (
    <Box position={'fixed'} bottom={0} width='100%' padding={1}>
      <Stack direction={'row'} spacing={2} justifyContent='flex-end'>
        {children}
      </Stack>
    </Box>
  );
}