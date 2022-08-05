importScripts('https://www.gstatic.com/firebasejs/7.19.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.19.0/firebase-messaging.js');

self.__WB_DISABLE_DEV_LOGS = true;

firebase.initializeApp({
  apiKey: "AIzaSyAQ7u4UWLyPZ9dgL9cwtBbXs4GX3th00Bg",
  authDomain: "portalnesia.firebaseapp.com",
  databaseURL: "https://portalnesia.firebaseio.com",
  projectId: "portalnesia",
  storageBucket: "portalnesia.appspot.com",
  messagingSenderId: "152584550462",
  appId: "1:152584550462:web:9e87f640a14eb1130d796f",
  measurementId: "G-V1ZMDC79KP"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload)=>{
    console.log('Received background message ', payload);
    const notificationTitle = payload.data.title;
    let notificationOptions = {
        body: payload.data.content,
        icon: payload.data.icon,
        click_action: payload.notification.click_action, // To handle notification click when notification is moved to notification tray
        requireInteraction: true,
        data: {
            click_action: payload.notification.click_action
        }
    };
    if(typeof payload.notification.image!=="undefined" && payload.notification.image!=="") notificationOptions.image=payload.notification.image;
    return self.registration.showNotification(notificationTitle,notificationOptions);
});
  
self.addEventListener('notificationclick', event => {
    //console.log('Clicked background message ', event.notification);
    //console.log('Clicked background message ', JSON.stringify(event));
    const url = event.notification.data;
    event.notification.close()

    event.waitUntil(
        //console.log('Clicked background message ', event)
        self.clients.openWindow(url)
    )
})