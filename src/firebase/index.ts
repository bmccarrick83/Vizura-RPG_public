'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseServices {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

/**
 * Initializes and returns the Firebase app and services.
 * This function is designed to be safe to call in any environment (client/server).
 * On the server, it returns null for all services.
 * On the client, it initializes the app (if not already done) and returns the services.
 */
export function initializeFirebase(): FirebaseServices {
  // Check if we're on the client and if the config is provided.
  if (typeof window !== 'undefined' && firebaseConfig.projectId) {
    // If no apps are initialized, initialize the main app.
    if (!getApps().length) {
      const firebaseApp = initializeApp(firebaseConfig);
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);
      return { firebaseApp, auth, firestore };
    }
    // If an app is already initialized, get the existing services.
    const firebaseApp = getApp();
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);
    return { firebaseApp, auth, firestore };
  }
  
  // On the server or if config is missing, return null services.
  return { firebaseApp: null, auth: null, firestore: null };
}

// Export the necessary hooks and providers for easy import.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
