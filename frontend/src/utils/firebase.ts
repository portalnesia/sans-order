import { getAnalytics as getAnalyticsOri,logEvent,setUserId } from 'firebase/analytics';
import {initializeApp} from 'firebase/app'
import {getMessaging as getMessagingOri} from 'firebase/messaging'

export {logEvent,setUserId} from 'firebase/analytics'
export {getToken,isSupported,onMessage} from 'firebase/messaging'
export {getToken as getAppCheckToken,ReCaptchaV3Provider,initializeAppCheck,onTokenChanged} from 'firebase/app-check'

const firebaseConfig = {
  apiKey: "AIzaSyByZGOrzLEF9C28Mq_98BeCKaaL-FVRviU",
  authDomain: "sans-order.firebaseapp.com",
  projectId: "sans-order",
  storageBucket: "sans-order.appspot.com",
  messagingSenderId: "770501761513",
  appId: "1:770501761513:web:27d7b3f5e2d5481e965378",
  measurementId: "G-WBKPG1KSCS"
};

const firebaseApp = initializeApp(firebaseConfig)

const getAnalytics = ()=>getAnalyticsOri(firebaseApp);

const getMessaging = ()=>getMessagingOri(firebaseApp);

export {getAnalytics,getMessaging}
export default firebaseApp;