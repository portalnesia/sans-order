import {MenuItem,TextField,TextFieldProps} from '@mui/material'
import {isMobile} from 'react-device-detect'

export interface SelectItemProps {
    value: string|number;
    children: string|number;
}

export default function Select(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      select
      {...(isMobile ? {
        SelectProps:{...props?.SelectProps,native:true}
      } : {})}
    />
  )
}

export function SelectItem(props: SelectItemProps) {
  if(isMobile) {
    return <option {...props} />
  } else {
    return <MenuItem {...props} />
  }
}