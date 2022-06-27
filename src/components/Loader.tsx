import {memo,useEffect} from 'react'
// @ts-ignore
import NProgress from 'nprogress'
import {useRouter} from 'next/router'
import loadingImage from '@comp/loading-image-base64'
//import * as gtag from 'portal/utils/gtag'
import 'nprogress/nprogress.css'
import { CircularProgress } from '@mui/material'

NProgress.configure({speed: 500,showSpinner:false,minimum: 0.2,trickleSpeed: 100});
let popShallow=false,backShallow=false
function Loaders(){
    //const [open,setOpen]=React.useState(false)
    const router = useRouter()

    useEffect(()=>{
        const startLoading=()=>{
            //setOpen(true)
            NProgress.start()
        }

        const routeChangeStart=(url: string,{shallow}: {shallow: boolean})=>{
            if(shallow || popShallow) {
                backShallow = !popShallow;
            } else {
                startLoading()
                popShallow = false;
                backShallow = false;
            }
            popShallow = false;
        }

        const stopLoading=()=>{
            //setOpen(false)
            NProgress.done()
        }

        const completeLoading=(url: string)=>{
            //gtag.pageview(url)
            stopLoading()
        }
        
        router.events.on('routeChangeStart',routeChangeStart);
        router.events.on('routeChangeComplete',completeLoading);
        router.events.on('routeChangeError',stopLoading);

        router.beforePopState(({url,as,options})=>{
            if(backShallow && !options.shallow) {
                popShallow = true;
                router.replace(url,as,{shallow:true})
                return false
            }
            popShallow = false;
            return true;
        })

        return()=>{
            router.events.off('routeChangeStart',routeChangeStart);
            router.events.off('routeChangeComplete',completeLoading);
            router.events.off('routeChangeError',stopLoading);
        }
    },[])

    return null;
}
const Loader = memo(Loaders)

export function SplashScreen() {
  return (
    <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
      <img style={{position:'fixed',top:'35%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
      <CircularProgress size={60} sx={{color:'white',position:'fixed',top:'60%',left:'calc(50% - 30px)'}} />
    </div>
  )
}

export default Loader