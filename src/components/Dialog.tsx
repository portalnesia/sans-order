import {useCallback} from 'react'
import {Dialog as Dialogg,DialogProps as Props} from '@mui/material'
import {useSelector,State} from '@redux/index'

export interface DialogProps extends Props {
  handleClose?(): void
  loading?: boolean
}

export default function Dialog({handleClose,loading,onClose:_,...other}: DialogProps) {
  const theme = useSelector<State['redux_theme']>(s=>s.redux_theme);

  const onClose = useCallback((event: {}, reason: "backdropClick" | "escapeKeyDown")=>{
    if(reason === 'escapeKeyDown' && handleClose && !loading) handleClose();
  },[handleClose,loading])

  return <Dialogg {...(theme === 'dark'  ? {PaperProps:{elevation:0}} : {})} onClose={onClose} fullWidth maxWidth='sm' scroll='body' {...other} />
}