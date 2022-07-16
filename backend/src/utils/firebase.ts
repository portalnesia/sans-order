import * as admin from 'firebase-admin'
import { applicationDefault } from 'firebase-admin/app'

const firebase  = admin.initializeApp({
    credential:applicationDefault(),
    projectId: "sans-order",
    storageBucket: "sans-order.appspot.com"
})

export default firebase;