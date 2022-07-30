import {IconButton,IconButtonProps} from '@mui/material'
import {styled} from '@mui/material/styles'

export interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

const ExpandMore = styled((props: ExpandMoreProps)=>{
  const {expand,...rest}=props
  return <IconButton {...rest} />;
})(({theme,expand})=>({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft:'auto',
  transition: theme.transitions.create('transform',{
    duration: theme.transitions.duration.shorter
  })
}))

export default ExpandMore;