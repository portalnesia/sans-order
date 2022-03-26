import {useCallback} from 'react'
import {useSnackbar} from 'notistack'
import { styled } from '@mui/material/styles';
import {IconButton,IconButtonProps} from '@mui/material'
import dynamic from 'next/dynamic'

const Close = dynamic(()=>import('@mui/icons-material/Close'),{ssr:false})

export type VariantOption= 'default' | 'error' | 'success' | 'warning' | 'info' | boolean

export type OptionSnack={
    content?:(key: string|number,message: string|React.ReactNode)=>React.ReactNode,
    action?:(key: string|number)=>React.ReactNode,
    autoHideDuration?: number|null
}

const CustomIconBtn = styled(IconButton)<IconButtonProps & ({variant:VariantOption})>(({variant,theme})=>({
    ...(typeof variant === 'boolean' ? {
        '& svg':{
            color:'#FFF'
        }
    } : {})
}))

export default function useNotification() {
  const {enqueueSnackbar,closeSnackbar}=useSnackbar();

  const setNotif=useCallback((msg: string|React.ReactNode,variant: VariantOption,option?: OptionSnack)=>{
      option=option||{};
      if(typeof option?.content === 'undefined') {
          option={
              ...option,
              action:(key)=>(
                  <CustomIconBtn
                      variant={variant}
                      onClick={()=>closeSnackbar(key)}
                      size="large">
                      <Close />
                  </CustomIconBtn>
              )
          }
      }
      const vari=typeof variant === 'string' ? variant : (variant===true ? 'error' : 'success');
      enqueueSnackbar(msg,{variant:vari,...option})
  },[enqueueSnackbar,closeSnackbar])

  return setNotif;
}