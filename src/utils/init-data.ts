import {useState,useEffect} from 'react'
import SessionStorage from "./local-storage";
import portalnesia from './portalnesia'
import {TokenResponse} from '@portalnesia/portalnesia-js'
import {useDispatch,State} from '@redux/index'
import {getToken,initializeAppCheck,ReCaptchaV3Provider,onTokenChanged,Unsubscribe} from 'firebase/app-check'
import firebase from './firebase'
import {useRouter} from 'next/router'
import cookie from 'js-cookie'
import {getDayJs} from '@utils/Main'

async function initData() {
  const savedToken = SessionStorage.get<TokenResponse>('sans_token');
  if(savedToken) {
    let tokens = portalnesia.oauth.setToken(savedToken);

    if(tokens.isExpired()) {
      tokens = await portalnesia.oauth.refreshToken();
    }
    if(tokens.token.id_token) {
      try {
        const user = await portalnesia.oauth.verifyIdToken(tokens.token.id_token) as any;
        if(user.sub) user.sub = Number.parseInt(user.sub);
        return user as State['user'];
      } catch {
        return false;
      }
    }
    return false;
  }
  return false;
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

let _loaded=false
export default function useIniData() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loaded,setLoaded] = useState(_loaded);
  const [adBlock,setAdBlock] = useState(false);

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
        const token = await getAppToken(onTokenIsChanged);
        unsubcribe = token.unsubcribe;
        dispatch({type:"CUSTOM",payload:{appToken:token.token}});
        const user = await initData();
        dispatch({type:"CUSTOM",payload:{user}});
      } catch(e) {
        console.log(e)
        dispatch({type:"CUSTOM",payload:{user:false}})
      } finally {
        _loaded=true;
        setLoaded(true);
      }
    }

    function PNtokenRefresh(token: TokenResponse & ({expiredAt: number})){
      cookie.set("_so_token_",token.access_token,{
        expires:getDayJs(token.expiredAt).toDate()
      })
      SessionStorage.set('sans_token',token);
    }

    portalnesia.on('token-refresh',PNtokenRefresh)
    //console.log("LOADED",_loaded)
    if(!_loaded) init();

    return ()=>{
      if(unsubcribe) unsubcribe();
      portalnesia.off('token-refresh',PNtokenRefresh)
    }
  },[])

  useEffect(()=>{
    if(router.isReady) {
      const locale = cookie.get('NEXT_LOCALE');
      if((router.locale||'en')!==(locale||'en')) {
        const {pathname,query,asPath} = router;
        router.replace({pathname,query},asPath,{locale:(locale||'en')})
      }
    }
  },[router.isReady])

  return {loaded,adBlock}
}