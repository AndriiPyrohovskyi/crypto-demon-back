import * as admin from 'firebase-admin';
import { initializeApp as initClientApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}');

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS!)),
});

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
};

const clientApp = initClientApp(firebaseConfig);
const clientAuth = getAuth(clientApp);

export { admin, clientAuth, signInWithEmailAndPassword };
