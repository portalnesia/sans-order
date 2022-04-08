
import {memo} from 'react'
import {Breadcrumbs as BC,Link as MuiLink,Typography,BreadcrumbsProps as BCProps} from '@mui/material'
import {styled} from '@mui/material/styles'
import Link from 'next/link'


type BroadcrumbsRoutes = {
    label: string,
    href?: string,
    as?: string
}

export interface BroadcrumbsProps  {
    routes?: BroadcrumbsRoutes[];
    title: string;
    sx?: BCProps['sx']
}

const MuiLinkStyle = styled(MuiLink)(({theme})=>({
    '&:hover':{
        color:theme.palette.primary.main
    }
}))

const Div = styled('div')(({theme})=>({
    marginBottom:theme.spacing(3)
}))

function BreadcrumbsComp(props: BroadcrumbsProps) {
    const {title,routes,sx} = props
    return (
        <Div sx={sx}>
            <BC aria-label='breadcrumbs'>
                <Link key={`breadcrumbs-home`} href={'/'} passHref>
                    <MuiLinkStyle underline='hover' color='text.disabled'><Typography style={{margin:'0 !important',fontSize:14}}>SansOrder</Typography></MuiLinkStyle>
                </Link>
                {routes ? routes.map((r,i)=>{
                    if(r.href) {
                        return (
                            <Link key={`breadcrumbs-${i}`} href={r.href} as={r.as} passHref>
                                <MuiLinkStyle underline='hover' color='text.disabled'><Typography style={{margin:'0 !important',fontSize:14}}>{r.label}</Typography></MuiLinkStyle>
                            </Link>
                        )
                    }
                    return <Typography key={`breadcrumbs-${i}`} style={{margin:'0 !important',fontSize:14}}>{r.label}</Typography>
                }) : null}
                <Typography key={`breadcrumbs-currentpage`} sx={{color:'text.primary'}} style={{margin:'0 !important',fontSize:14}}>{title}</Typography>
            </BC>
        </Div>
    )
}

/**
 * 
 * Breadcrumbs Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Breadcrumbs = memo(BreadcrumbsComp);
export default Breadcrumbs;