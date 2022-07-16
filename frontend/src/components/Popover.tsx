import React from 'react'
import {IconButton,Typography,Box} from '@mui/material'
import MenuPopover,{MenuPopoverProps} from './MenuPopover'
import Iconify from './Iconify'

export interface PopoverProps extends Partial<MenuPopoverProps> {
    /**
     * Icon of button
     * 
     * @example clarity:help-outline-badged
     */
    icon: string
}

/**
 * 
 * Popover Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const PopoverComponent=(props: PopoverProps)=>{
    const {icon,children,onClose,open:op,anchorEl:_,...rest} = props
    const anchorRef = React.useRef(null)
    const [open,setOpen] = React.useState(op||false);

    const handlePopOver: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(()=>{
        setOpen(true)
    },[])

    const closePopOver=React.useCallback((event: {}, reason: "backdropClick" | "escapeKeyDown")=>{
        setOpen(false)
        if(onClose) onClose(event,reason);
    },[onClose])

    return (
        <React.Fragment>
            <IconButton ref={anchorRef} onClick={handlePopOver}>
                <Iconify icon={icon} />
            </IconButton>
            <MenuPopover
                open={open}
                onClose={closePopOver}
                anchorEl={anchorRef.current}
                paperSx={{
                    width:{xs:200,md:400},
                }}
                {...rest}
            >
                <Box padding={1.5}>
                    {typeof children === 'string' ? (
                        <Typography>{children}</Typography>
                    ) : children}
                </Box>
            </MenuPopover>
        </React.Fragment>
    );
}

const Popover = React.memo(PopoverComponent);
export default Popover