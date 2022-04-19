import {useState,useEffect} from 'react'
import LottieComp,{LottieComponentProps} from 'lottie-react'
import { styled,SxProps,Theme, useTheme } from '@mui/material'
import { Circular } from './Loading'

const LottieStyle = styled(LottieComp)(()=>({}))

export interface LottieProps extends LottieComponentProps {
  animationData?: any,
  animation?: string,
  sx?: SxProps<Theme>
}

export default function Lottie({loop=true,autoPlay=true,animationData,animation,...other}: LottieProps) {
  const [anim,setAnim] = useState<any>(null);
  const theme = useTheme();

  useEffect(()=>{
    async function getAnim() {
      if(animationData) setAnim(animationData);
      else if(animation) {
        const dt = (await import(`../lottie/${animation}-${theme.palette.mode==='dark' ? 'dark':"light"}.json`))?.default;
        if(dt) setAnim(dt)
      }
    }
    getAnim();  
  },[animationData,animation,theme])
  if(!anim) return <Circular />
  //@ts-ignore
  return <LottieStyle loop autoPlay animationData={anim} {...other} />
}