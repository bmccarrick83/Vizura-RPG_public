
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

// This interface defines the shape of the context value.
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  areServicesAvailable: boolean;
}

// Create the context with an undefined initial value.
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

/**
 * Provides Firebase services and authentication state to its children.
 * It is responsible for listening to authentication changes and updating the context.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Derived state to indicate if Firebase services are ready.
  const areServicesAvailable = !!(firebaseApp && firestore && auth);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setIsUserLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
    user,
    isUserLoading,
    areServicesAvailable,
  }), [firebaseApp, firestore, auth, user, isUserLoading, areServicesAvailable]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


// --- Custom Hooks for Consuming the Context ---

/**
 * A private base hook to safely access the context.
 * This is the single point of contact with the context, ensuring consistency.
 */
const useFirebaseContext = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    // This error is critical because it indicates a fundamental setup issue.
    throw new Error('useFirebaseContext must be used within a FirebaseProvider.');
  }
  return context;
};

/**
 * Hook to access the Firebase App instance.
 * Returns null if Firebase is not yet initialized.
 */
export const useFirebaseApp = (): FirebaseApp | null => {
  return useFirebaseContext().firebaseApp;
};

/**
 * Hook to access the Firestore instance.
 * Returns null if Firebase is not yet initialized.
 */
export const useFirestore = (): Firestore | null => {
  return useFirebaseContext().firestore;
};

/**
 * Hook to access the Firebase Auth instance.
 * Returns null if Firebase is not yet initialized.
 */
export const useAuth = (): Auth | null => {
  return useFirebaseContext().auth;
};

/**
 * Hook specifically for accessing the authenticated user's state.
 * This is the recommended way for components to get user info.
 * @returns An object with the user and loading state.
 */
export const useUser = () => {
    const { user, isUserLoading, areServicesAvailable } = useFirebaseContext();
    return { user, isUserLoading: !areServicesAvailable || isUserLoading };
};
