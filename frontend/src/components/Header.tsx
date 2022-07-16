import React, { ReactNode,useMemo } from 'react';
import Head from 'next/head'
import config from '@root/web.config.json'
import { IPages } from '@type/index';
import ForbiddenComp from './Forbidden';
import Feedback,{IData} from './Feedback';
import { useDispatch,useSelector,State } from '@redux/index';
import { useAPI } from '@utils/api';
import { useTranslation } from 'next-i18next';
import useNotification from '@utils/notification';
import {Portal} from '@mui/material'
import { AxiosRequestConfig } from 'axios';
import { uuid } from '@portalnesia/utils';
import { useTheme } from '@mui/material';
import { getMessaging,isSupported,onMessage,getToken } from '@utils/firebase';
import LocalStorage from '@utils/local-storage';
import { MessagePayload, NextFn, Observer, Unsubscribe } from 'firebase/messaging';
// material
// ----------------------------------------------------------------------

export interface HeaderProps {
  children: ReactNode,
  title?: string,
  desc?: string|null,
  image?: string|null
}

let sudah=false;
export default function Header({ children, title,desc }: HeaderProps) {
  const {t} = useTranslation('common')
  const titles = useMemo(()=>title ? `${title} | ${config.title}` : config.title,[title]);
  const description = useMemo(()=>typeof desc === 'string' && desc.length > 0 ? `${desc} - ${config.description}` : config.description,[desc]);
  const dispatch = useDispatch();
  const [loading,setLoading] = React.useState<string|null>(null);
  const {report,ready,user} = useSelector<Pick<State,'report'|'ready'|'user'>>(s=>({report:s.report,ready:s.ready,user:s.user}))
  const {post} = useAPI();
  const theme = useTheme();
  const setNotif = useNotification();

  const feedbackSubmit=React.useCallback((type:string,addi:Record<string,any>={})=>async(dt: IData)=>{
    setLoading('feedback')
    try {
      const {text,sysInfo: sysInfoObj,screenshot} = dt
      let data: Record<string,any> | FormData,opt: AxiosRequestConfig|undefined=undefined;
      const sysInfo = JSON.stringify(sysInfoObj)
      if(screenshot) {
        opt = {
          headers:{
            'Content-Type':'multipart/form-data'
          }
        }
        const res = await fetch(screenshot);
        data = new FormData();
        const blob = await res.blob();
        const file = new File([blob],`${uuid('report')}.png`);
        data.append('image',file);
        data.append('text',text);
        data.append('sysInfo',sysInfo);
        Object.keys(addi).map(k=>{
          data.append(k,addi[k])
        })
      } else {
        data = {
          text,
          ...(screenshot ? {image:screenshot} : {}),
          sysInfo,
          ...addi
        }
      }
      await post(`/internal/report`,data);
      dispatch({type:"CUSTOM",payload:{report:null}});
    } catch(e: any) {
      setNotif((e?.message||t('error_500')),true);
    } finally {
      setLoading(null)
    }
  },[post,setNotif,t])

  React.useEffect(()=>{
    if(!ready) {
      window.document.body.classList.add('sans-scroll-disabled')
    } else {
      window.document.body.classList.remove('sans-scroll-disabled')
    }
  },[ready])

  /**
   * GET FIREBASE NOTIFICATION
   */
  React.useEffect(()=>{
    let timeout: NodeJS.Timeout|undefined;
    const messaging = getMessaging();
    let unsubcribe: Unsubscribe|undefined=undefined;

    const onFirebaseMessage: NextFn<MessagePayload> | Observer<MessagePayload> = (payload)=>{
      const dataLink=payload?.notification?.click_action||payload?.fcmOptions?.link||process.env.URL||"";
      const notificationTitle = payload.notification?.title||"Notification";
      const notificationOptions = {
        body: payload.notification?.body,
        icon: payload.notification?.icon,
        data:  dataLink,
        requireInteraction: true
      };

      if(Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration)=>{
          registration.showNotification(notificationTitle,notificationOptions);
        });
        const notification = new Notification(notificationTitle,notificationOptions);
        notification.onclick = ()=>{
          window.open(dataLink , '_blank');
          notification.close();
        }
      }
    }

    const getFirebaseToken=async(registration?: ServiceWorkerRegistration)=>{
      try {
        const id = LocalStorage.getID();
        if(registration && id) {
          const [firebaseSupport,notifGranted] = await Promise.all([
            isSupported(),
            Notification.requestPermission()
          ])
          if(firebaseSupport && notifGranted === 'granted') {
            const token = await getToken(messaging,{
              serviceWorkerRegistration:registration,
              vapidKey:'BCchOVH17v-HJon-RqIZE-bWVcvVT9F2KFb73kwDwBzvlyLxG_gYMYJ_TpcCPyif4t42NSYibviJHHxjUb5nXOY'
            })
            await Promise.all([
              post("/internal/send-notification",{token,id,apps:'SansOrder Web'})
            ])
          }
        }
      } catch(e) {
        console.log("Notification Error",e)
      }
    }

    if(user && process.env.NEXT_PUBLIC_PN_ENV === 'production') {
      if(!sudah) {
        sudah=true;

        timeout = setTimeout(()=>{
          navigator.serviceWorker.ready.then(getFirebaseToken).catch(()=>{});
        },5000)
      }
    }
    unsubcribe = onMessage(messaging,onFirebaseMessage);

    return ()=>{
      if(sudah) {
        if(timeout) clearTimeout(timeout)
        timeout = undefined;
      }
      if(unsubcribe) unsubcribe();
      unsubcribe = undefined;
    }
  },[user])
  /** END FIREBASE NOTIFICATION */

  return (
    <>
      <Head>
        <title>{titles}</title>
        <meta name='description' content={description} />
        <meta name="theme-color" content={theme.palette.background.default} />
      </Head>
      {children}
      {report!==null && <Portal><Feedback title="Send Report" onCancel={()=>dispatch({type:'CUSTOM',payload:{report:null}})} onSend={feedbackSubmit(report?.type,{...report})} required={false} disabled={loading==='feedback'} {...(report?.type==='url' ? {placeholder:"We are sorry for the inconvenience, it seems that there is a problem with our internal server service. Can you tell us how this happened?"} : {})} /></Portal> }
    </>
  )
};

export function withForbidden<D,P extends IPages<D>>(Component: React.ComponentType<P>): React.FC<P> {
  return function(props: P) {
    if((props as IPages<D>).err) {
      if(props.err === 1818) {
        return <ForbiddenComp />
      }
    }
    return <Component {...props} />
  }
}