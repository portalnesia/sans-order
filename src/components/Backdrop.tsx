import React from 'react'
import {BackdropProps as BDProps} from '@mui/material'
import {styled} from '@mui/material/styles';
import dynamic from 'next/dynamic'

const Backdrops = dynamic(()=>import('@mui/material/Backdrop'))
const CircularProgress = dynamic(()=>import('@mui/material/CircularProgress'))
const Linear = dynamic(()=>import('@mui/material/LinearProgress'))
const Box = dynamic(()=>import('@mui/material/Box'))
const Typography = dynamic(()=>import('@mui/material/Typography'))

const LinearProgress = styled(Linear)(()=>({
    '&.MuiLinearProgress-root': {
        height:10,
        borderRadius: 5,
    }
}))

export interface BackdropProps extends BDProps {
    open: boolean,
    children?: React.ReactNode,
    progress?: number;
    loading?: boolean;
    textColor?:'theme'|'white'
}

const Div = styled('div')(({theme})=>({
    width:'100%',
    textAlign:'center',
    [theme.breakpoints.up('md')]: {
        margin:'0 100px'
    },
    [theme.breakpoints.down('sm')]: {
        margin:'0 20px'
    }
}))

function ProgressComponent({progress,textColor}: {progress:number,textColor?:'theme'|'white'}){

    return (
        <div style={{display:'inline-flex',width:'100%',margin:'20px 5px'}}>
            <Box display='flex' alignItems='center' justifyContent='center' width='100%' >
                <Box flex="1" width='100%' mr={1}>
                    <LinearProgress sx={{height:'13px !important'}} variant='determinate' value={Math.round(progress)} />
                </Box>
                <Box display='flex' minWidth={60} textAlign='right' justifyContent="flex-end">
                    <Typography variant='h6' {...(textColor==='white' ? {color:'#fff'}:{})}>{`${Math.round(progress)}%`}</Typography>
                </Box>
            </Box>
        </div>
    )
}

export const ProgressLinear = React.memo(ProgressComponent)

function CustomBackdrop(props: BackdropProps) {
    const {open,children,progress,loading=true,textColor='white',...other} = props;

    if(!open) return null;
    return(
        <Backdrops open={open} sx={{zIndex:2000,...(textColor==='white' ? {color:'#fff'} : {})}} {...other}>
            <Div>
                {loading && (
                    <div style={{margin:'20px 0'}}>
                        <CircularProgress color='inherit' thickness={5} size={50} />
                    </div>
                )}
                {progress && <ProgressLinear progress={progress} textColor={textColor} /> }
                {children && <div style={{...(textColor==='white' ? {color:'#fff'} : {})}}>{children}</div>}
            </Div>
        </Backdrops>
    )
}
const Backdrop = React.memo(CustomBackdrop);
export default Backdrop;