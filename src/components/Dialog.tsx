import {useCallback} from 'react'
import {Dialog as Dialogg,DialogProps as Props} from '@mui/material'

export interface DialogProps extends Props {
  handleClose?(): void
  loading?: boolean
}

export default function Dialog({handleClose,loading,onClose:_,...other}: DialogProps) {
  const onClose = useCallback((event: {}, reason: "backdropClick" | "escapeKeyDown")=>{
    if(reason === 'escapeKeyDown' && handleClose && !loading) handleClose();
  },[handleClose,loading])

  return <Dialogg onClose={onClose} fullWidth maxWidth='sm' scroll='body' {...other} />
}