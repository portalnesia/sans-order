import {useState,useEffect} from 'react'
import portalnesia from './api'
import {useDispatch,State, useSelector} from '@redux/index'
import firebase,{getAnalytics,setUserId,getAppCheckToken,ReCaptchaV3Provider,initializeAppCheck,onTokenChanged} from './firebase'
import {useRouter} from 'next/router'
import cookie from 'js-cookie'
import useDarkTheme from '@utils/useDarkTheme'
import { Unsubscribe } from 'firebase/app-check';

/**
 * GET PORTALNESIA SAVED TOKEN AND REFRESH IF EXPIRED
 */
async function initData() {
  try {
    const savedToken = portalnesia.getToken();
    if(savedToken) {
      return savedToken;
    }
    return undefined;
  } catch(e) {
    console.log(e);
    return undefined;
  }
}

/**
 * GET FIREBASE APP CHECK TOKEN
 */
async function getAppToken(callback: (token: string)=>void) {
  if(process.env.NODE_ENV==='development') {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN;
  }
  const provider = new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA as string);
  const appCheck = initializeAppCheck(firebase,{provider,isTokenAutoRefreshEnabled:true});

  const tokenUnsubcribe = onTokenChanged(appCheck,(token)=>{
    callback(token.token);
  })

  const token = await getAppCheckToken(appCheck);

  return {
    token:token.token,
    unsubcribe:tokenUnsubcribe
  };
}

export default function useIniData() {
  const router = useRouter();
  const {user} = useSelector<Pick<State,'user'>>(s=>({user:s.user}));
  const [readyInit,setReadyInit] = useState(false);
  const dispatch = useDispatch();
  const [adBlock,setAdBlock] = useState(false);
  const {checkTheme,setTheme} = useDarkTheme();

  useEffect(()=>{
    let unsubcribe: Unsubscribe|undefined;

    setTimeout(()=>{
      const ads=document.getElementById('wrapfabtest')
      if(ads) {
        const height=ads.clientHeight||ads.offsetHeight;
        if(height <= 0) setAdBlock(true)
      } else {
        setAdBlock(true)
      }
    },500)

    function onTokenIsChanged(token: string){
      dispatch({type:"CUSTOM",payload:{appToken:token}})
    }

    /**
     * Init Data
     * Get Firebase App Check
     * Init Portalnesia Token to Portalnesia Instance
     */
    async function init() {
      try {
        setTheme(checkTheme());
        const token = await getAppToken(onTokenIsChanged);
        unsubcribe = token.unsubcribe;
        await initData();
        dispatch({type:"CUSTOM",payload:{appToken:token.token}});
        setReadyInit(true);
      } catch(e) {
        dispatch({type:"CUSTOM",payload:{user:false}})
        setReadyInit(true);
      }
    }
    init();

    return ()=>{
      if(unsubcribe) unsubcribe();
    }
  },[])

  useEffect(()=>{
    /**
     * WHEN READY IS COMPLETED
     * Get Portalnesia Token AND SET STATE
     */
    async function initUser() {
      const analytics = getAnalytics();
      try {
        if(portalnesia.user) {
          setUserId(analytics,`${portalnesia.user.id}`)
          dispatch({type:"CUSTOM",payload:{user:portalnesia.user,ready:true}})
          return;
        }
      } catch {}
      dispatch({type:"CUSTOM",payload:{user:false,ready:true}})
    }
    if(readyInit && user===null) {
      initUser();
    }
  },[readyInit,user])

  useEffect(()=>{
    if(router.isReady) {
      const locale = cookie.get('NEXT_LOCALE');
      if((router.locale||'en')!==(locale||'en')) {
        const {pathname,query,asPath} = router;
        router.replace({pathname,query},asPath,{locale:(locale||'en')})
      }
    }
  },[router.isReady])

  return {adBlock}
}