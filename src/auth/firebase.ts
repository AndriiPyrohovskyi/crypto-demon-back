import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

let serviceAccount: admin.ServiceAccount;

if (process.env.FIREBASE_CONFIG) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (err) {
    throw new Error('Invalid FIREBASE_CONFIG format in environment variables');
  }
} else {
  const serviceAccountPath =
    process.env.FIREBASE_CONFIG_PATH || path.resolve(__dirname, '..', 'firebase-service-account.json');

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Firebase service account file not found at path: ${serviceAccountPath}`);
  }

  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };
