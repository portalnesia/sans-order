import React from 'react'
import {TooltipProps} from '@mui/material'
import {LoadingButton as Buttonn,LoadingButtonProps} from '@mui/lab'
import {Save,Delete,NavigateNext,Download,Upload,InsertDriveFile,Preview,CropRotate,Add,AddAPhoto,AddLink,Send as SendIcon} from '@mui/icons-material'
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic'

const Toltip = dynamic(()=>import('@mui/material/Tooltip'))

const Div = styled('div')(()=>({
    position:'relative',
    height:'100%'
}))

const Tooltip = styled(Toltip)(()=>({
    '& .MuiTooltip-tooltip':{
        fontsize:16
    }
}))

export interface ButtonProps extends LoadingButtonProps {
    /**
     * @deprecated Use loading instead
     * 
     */
    isloading?: boolean;
    /**
    * Message for tooltip components.
    */
    tooltip?: string;
    /**
    * If `true`, the button will use variant outline.
    */
    outlined?: boolean;
    /**
     * If true, the button will use variant text
     */
    text?: boolean
    /**
    * Props for tooltip component
    */
    tooltipProps?: TooltipProps
    children?: React.ReactNode
    disabled?:boolean;
    icon?: string | React.ReactNode | undefined
}

/**
 * 
 * Custom Button Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Button=React.forwardRef<HTMLButtonElement,ButtonProps>((props,ref)=>{
    const {size="small",loadingPosition: loadingPosisi,disabled=false,outlined=false,children="",color,variant="contained",tooltip,text,style,endIcon,icon,tooltipProps={interactive:true,enterTouchDelay:100},loading,isloading,...other}=props
    const loadingPosition = loadingPosisi ? loadingPosisi : (icon||endIcon) ? "end" : "center";
    const cusIcon = React.useMemo((): React.ReactNode|undefined=>{
        if(endIcon) return endIcon;
        if(typeof icon === 'string') {
            if(icon === 'save') return <Save />
            if(icon === 'delete') return <Delete />
            if(icon === 'submit') return <NavigateNext />
            if(icon === 'download') return <Download />
            if(icon === 'upload') return <Upload />
            if(icon === 'addfile') return <InsertDriveFile />
            if(icon === 'preview') return <Preview />
            if(icon === 'rotate') return <CropRotate />
            if(icon === 'add') return <Add />
            if(icon === 'addphoto') return <AddAPhoto />
            if(icon === 'addlink') return <AddLink />
            if(icon === 'send') return <SendIcon />
        }
        return undefined;
    },[icon,endIcon])
    if(tooltip && !disabled){
        return(
            <Tooltip title={tooltip} {...tooltipProps}>
                <Buttonn
                    loading={isloading||loading}
                    disabled={disabled}
                    size={size}
                    style={{height:'100%',...style}}
                    {...(outlined ? {variant:'outlined'} : text ? {variant:'text'} : {variant,color})}
                    ref={ref}
                    loadingPosition={loadingPosition}
                    {...(cusIcon ? {endIcon:cusIcon} : {})}
                    {...other}
                >
                    {children}
                </Buttonn>
            </Tooltip>
        )
    } else {
        return(
            <Buttonn
                loading={isloading||loading}
                disabled={disabled}
                size={size}
                style={{height:'100%',...style}}
                ref={ref}
                loadingPosition={loadingPosition}
                {...(outlined ? {variant:'outlined'} : text ? {variant:'text'} : {variant,color})}
                {...(cusIcon ? {endIcon:cusIcon} : {})}
                {...other}
            >
                {children}
            </Buttonn>
        )
    }
})

export default Button