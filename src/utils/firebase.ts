import {initializeApp} from 'firebase/app'

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

export default firebaseApp;