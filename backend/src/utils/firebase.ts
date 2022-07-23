import * as admin from 'firebase-admin'
import { applicationDefault } from 'firebase-admin/app'

const firebase  = process.env.NODE_ENV !== 'test' ? admin.initializeApp({
  credential:applicationDefault(),
  projectId: "sans-order",
  storageBucket: "sans-order.appspot.com"
}) : undefined;

export default firebase;