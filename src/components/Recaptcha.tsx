import React from 'react'
import {useSelector} from 'react-redux'
//import {ApiError} from 'portal/utils/api'
//import {useNotif,VariantOption,OptionSnack} from 'portal/components/Notification'
import Script from 'next/script'

export type ReCaptchaProps={
    action?: 'social'|'login',
    onReady?:()=> void
}

/**
 * 
 * ReCaptcha Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
class Recaptcha extends React.PureComponent<ReCaptchaProps>{
    constructor(props: ReCaptchaProps){
        super(props)
        this.execute=this.execute.bind(this)
    }
    static defaultProps={
        action:'social',
        onReady:()=>{}
    }
    execute(){
        return new Promise<string>((res,rej)=>{
            (window as any).grecaptcha?.execute(`${process.env.NEXT_PUBLIC_RECAPTCHA}`, {action: this.props.action||'social'})
            .then((token: string)=>{
                res(token)
            })
            .catch((e: any)=>{
                rej(new Error(e?.message||"Failed to get recaptcha token. Please try again"))
            });
        })
    }
    onLoad() {
        if((window as any).grecaptcha?.ready==='function') {
            (window as any).grecaptcha?.ready(()=>{
                this.props.onReady && this.props.onReady()
            });
        }
    }
    render(){
        return <Script key='grecaptcha' strategy="lazyOnload" onLoad={()=>this.onLoad()} src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA}`} />
    }
}

export default Recaptcha;