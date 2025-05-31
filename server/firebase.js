import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serviceKeyPath = path.join(dirname, 'firebaseServiceKey.json');

// Check if service key exists
let serviceAccount = null;
if (fs.existsSync(serviceKeyPath)) {
  try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf8'));
    console.log('Firebase service key loaded successfully');
  } catch (error) {
    console.warn('Failed to load Firebase service key:', error.message);
  }
} else {
  console.warn('Firebase service key not found. Firebase features will be disabled.');
}

// Only initialize Firebase if we have a valid service account
if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error.message);
  }
}

export default admin;