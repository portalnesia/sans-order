import {useState,useEffect} from 'react'
import LocalStorage from "./local-storage";
import portalnesia from './portalnesia'
import {TokenResponse} from '@portalnesia/portalnesia-js'
import {useDispatch,State, useSelector} from '@redux/index'
import {getToken,initializeAppCheck,ReCaptchaV3Provider,onTokenChanged,Unsubscribe} from 'firebase/app-check'
import firebase from './firebase'
import {useRouter} from 'next/router'
import cookie from 'js-cookie'
import {getDayJs} from '@utils/Main'
import useDarkTheme from '@utils/useDarkTheme'

async function initData() {
  try {
    const savedToken = LocalStorage.get<TokenResponse>('sans_token');
    if(savedToken) {
      let tokens = portalnesia.oauth.setToken(savedToken);
      if(tokens.isExpired()) {
        tokens = await portalnesia.oauth.refreshToken();
      }
      LocalStorage.set('sans_token',tokens.token);
      return tokens
    }
    return undefined;
  } catch(e) {
    console.log(e);

    //LocalStorage.remove('sans_token');
    return undefined;
  }
}

async function verifyIdToken(token: string) {
  try {
    const user = await portalnesia.oauth.verifyIdToken(token) as any;
    if(user.sub) user.sub = Number.parseInt(user.sub);
    return user as State['user'];
  } catch {
    return false;
  }
}

async function getAppToken(callback: (token: string)=>void) {
  if(process.env.NODE_ENV==='development') {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  const provider = new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA as string);
  const appCheck = initializeAppCheck(firebase,{provider,isTokenAutoRefreshEnabled:true});

  const tokenUnsubcribe = onTokenChanged(appCheck,(token)=>{
    callback(token.token);
  })

  const token = await getToken(appCheck);

  return {
    token:token.token,
    unsubcribe:tokenUnsubcribe
  };
}

export default function useIniData() {
  const router = useRouter();
  const {ready,user} = useSelector<Pick<State,'user'|'ready'>>(s=>({ready:s.ready,user:s.user}));
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

    async function init() {
      try {
        setTheme(checkTheme());
        const token = await getAppToken(onTokenIsChanged);
        unsubcribe = token.unsubcribe;
        await initData();
        dispatch({type:"CUSTOM",payload:{appToken:token.token,ready:true}});
      } catch(e) {
        dispatch({type:"CUSTOM",payload:{user:false,ready:true}})
      }
    }

    async function PNtokenRefresh(token: TokenResponse & ({expiredAt: number})){
      try {
        if(token.id_token) {
          const user = await portalnesia.oauth.verifyIdToken(token.id_token) as any;
          if(user.sub) user.sub = Number.parseInt(user.sub);

          cookie.set("_so_token_",`${user.sub}`,{
            expires:getDayJs().add(1,'month').toDate()
          })

          dispatch({type:"CUSTOM",payload:{user}});
        }
      } catch {}
      LocalStorage.set('sans_token',token);
    }
    portalnesia.on('token-refresh',PNtokenRefresh)
    init();

    return ()=>{
      if(unsubcribe) unsubcribe();
      portalnesia.off('token-refresh',PNtokenRefresh)
    }
  },[])

  useEffect(()=>{
    async function initUser() {
      try {
        if(portalnesia.token?.token.id_token) {
          const users = await verifyIdToken(portalnesia.token?.token.id_token);
          dispatch({type:"CUSTOM",payload:{user:users}})
          return;
        }
      } catch {}
      dispatch({type:"CUSTOM",payload:{user:false}})
    }
    if(ready && user===null) {
      initUser();
    }
  },[ready,user])

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