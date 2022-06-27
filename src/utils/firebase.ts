import { getAnalytics as getAnalyticsOri,logEvent,setUserId } from 'firebase/analytics';
import {initializeApp} from 'firebase/app'
import {getMessaging as getMessagingOri} from 'firebase/messaging'

export {logEvent,setUserId} from 'firebase/analytics'
export {getToken,isSupported,onMessage} from 'firebase/messaging'

const firebaseConfig = {
    apiKey: "AIzaSyCVHHSOJz98Duilzyc4f_pQ3hCOtukPOmA",
    authDomain: "portalnesia.firebaseapp.com",
    databaseURL: "https://portalnesia.firebaseio.com",
    projectId: "portalnesia",
    storageBucket: "portalnesia.appspot.com",
    messagingSenderId: "152584550462",
    appId: "1:152584550462:web:b0c62f56cfa243240d796f",
    measurementId: "G-686S7E9ETS"
};

const firebaseApp = initializeApp(firebaseConfig)

const getAnalytics = ()=>getAnalyticsOri(firebaseApp);

const getMessaging = ()=>getMessagingOri(firebaseApp);

export {getAnalytics,getMessaging}
export default firebaseApp;