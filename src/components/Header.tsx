import React, { ReactNode,useMemo } from 'react';
import Head from 'next/head'
import config from '@root/web.config.json'
import { IPages } from '@type/index';
import ForbiddenComp from './Forbidden';
import Feedback,{IData} from './Feedback';
import { useDispatch,useSelector,State } from '@redux/index';
import Recaptcha from './Recaptcha';
import { useAPI } from '@utils/portalnesia';
import { useTranslation } from 'next-i18next';
import useNotification from '@utils/notification';
import {Portal} from '@mui/material'
// material
// ----------------------------------------------------------------------

export interface HeaderProps {
  children: ReactNode,
  title?: string,
  desc?: string|null,
  image?: string|null
}


export default function Header({ children, title,desc }: HeaderProps) {
  const {t} = useTranslation('common')
  const titles = useMemo(()=>title ? `${title} | ${config.title}` : config.title,[title]);
  const description = useMemo(()=>typeof desc === 'string' && desc.length > 0 ? `${desc} - ${config.description}` : config.description,[desc]);
  const dispatch = useDispatch();
  const [loading,setLoading] = React.useState<string|null>(null);
  const report = useSelector<State['report']>(s=>s.report)
  const captchaRef = React.useRef<Recaptcha>(null)
  const {post} = useAPI();
  const setNotif = useNotification();

  const feedbackSubmit=React.useCallback((type:string,addi?:Record<string,any>)=>async(dt: IData)=>{
    setLoading('feedback')
    try {
      const {text,sysInfo,screenshot} = dt
      const recaptcha = await captchaRef.current?.execute();
      const data = {
        text,
        ...(screenshot ? {image:screenshot} : {}),
        sysInfo: JSON.stringify(sysInfo),
        ...addi,
        recaptcha
      }
      await post(`/internal/report`,data);
      dispatch({type:"CUSTOM",payload:{report:null}});
    } catch(e: any) {
      setNotif((e?.message||t('error_500')),true);
    } finally {
      setLoading(null)
    }
  },[post,setNotif,t])

  return (
    <>
      <Head>
        <title>{titles}</title>
        <meta name='description' content={description} />
      </Head>
      {children}
      <Recaptcha ref={captchaRef} />
      {report!==null && <Portal><Feedback title="Send Report" onCancel={()=>dispatch({type:'CUSTOM',payload:{report:null}})} onSend={feedbackSubmit(report?.type,{...report})} required={false} disabled={loading==='feedback'} {...(report?.type==='url' ? {placeholder:"We are sorry for the inconvenience, it seems that there is a problem with our internal server service. Can you tell us how this happened?"} : {})} /></Portal> }
    </>
  )
};

export function withForbidden<P extends IPages>(Component: React.ComponentType<P>): React.FC<P> {
  return function(props: P) {
    if((props as IPages).err) {
      if(props.err === 1818) {
        return <ForbiddenComp />
      }
    }
    return <Component {...props} />
  }
}