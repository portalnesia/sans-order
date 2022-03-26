import React from 'react'
import {Avatar as Av,AvatarProps as AvaProps} from '@mui/material'
import {styled} from '@mui/material/styles' 
import {acronym} from '@portalnesia/utils'
import { deepOrange, deepPurple,green,pink,red,blue,indigo,brown,grey,cyan,teal,blueGrey } from '@mui/material/colors';
import clx from 'classnames'

const classes = {
    orange: 'avaOrange',
    purple: 'avaPurple',
    pink: 'avaPink',
    green: 'avaGreen',
    red: 'avaRed',
    blue: 'avaBlue',
    indigo: 'avaIndigo',
    brown: 'avaBrown',
    grey: 'avaGrey',
    cyan: 'avaCyan',
    teal: 'avaTeal',
    blueGrey: 'avaBlueGray'
}

const Ava = styled(Av)<{withTop?:boolean}>(({withTop,children})=>({
    ...(withTop && typeof children !== 'string' ? {
        '&.MuiAvatar-root':{
            paddingTop:3
        }
    } : {}),
    [`&.${classes.orange}`]: {
        color: '#fff',
        backgroundColor: deepOrange[500],
    },
    [`&.${classes.purple}`]: {
        color: '#fff',
        backgroundColor: deepPurple[500],
    },
    [`&.${classes.pink}`]: {
        color: '#fff',
        backgroundColor: pink[500],
    },
    [`&.${classes.green}`]: {
        color: '#fff',
        backgroundColor: green[500],
    },
    [`&.${classes.red}`]: {
        color: '#fff',
        backgroundColor: red[500],
    },
    [`&.${classes.blue}`]: {
        color: '#fff',
        backgroundColor: blue[500],
    },
    [`&.${classes.indigo}`]: {
        color: '#fff',
        backgroundColor: indigo[500],
    },
    [`&.${classes.brown}`]: {
        color: '#fff',
        backgroundColor: brown[500],
    },
    [`&.${classes.grey}`]: {
        color: '#fff',
        backgroundColor: grey[500],
    },
    [`&.${classes.cyan}`]: {
        color: '#fff',
        backgroundColor: cyan[500],
    },
    [`&.${classes.teal}`]: {
        color: '#fff',
        backgroundColor: teal[500],
    },
    [`&.${classes.blueGrey}`]: {
        color: '#fff',
        backgroundColor: blueGrey[500],
    },
}))

const randomArr=['orange','purple','pink','green','red','blue','indigo','brown','grey','cyan','teal','blueGrey'];

export interface AvatarProps extends AvaProps {
    withTop?:boolean
}

/**
 * 
 * Custom Avatar Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export default function Avatar(props: AvatarProps){
    const {children,className,style,withTop=false,...other}=props
    const [select,setSelect]=React.useState<null|string>(null);

    const child=React.useMemo(()=>{
        if(typeof children==='string') return acronym(children)
        else return children
    },[children])

    React.useEffect(()=>{
        if(select===null) {
            const i = Math.floor(Math.random() * randomArr.length);
            setSelect(randomArr[i])
        }
    },[])

    return (
        <Ava withTop={withTop} className={clx(className,typeof children==='string' && select!==null && typeof classes?.[(select as keyof typeof classes)] !== 'undefined' ? classes[(select as keyof typeof classes)] : '' )} {...(React.isValidElement(children) ? {style:{...style}} : {style:{...style,paddingTop:0}})} children={child} {...other} />
    )
}