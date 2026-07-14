import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../utils/firebaseConfig';

const isFirebaseConfigured = (config) => {
  const hasRequiredFields = Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );

  return hasRequiredFields && typeof config.apiKey === 'string' && config.apiKey.startsWith('AIza');
};

const shouldUseMockAuth = () => {
  if (import.meta.env.VITE_USE_MOCK_AUTH === 'false') return false;
  return import.meta.env.VITE_USE_MOCK_AUTH === 'true' || !isFirebaseConfigured(firebaseConfig);
};

let auth;
let initializeFirebase = false;
let firebaseInitError = null;

if (!shouldUseMockAuth()) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    initializeFirebase = true;
  } catch (error) {
    firebaseInitError = error;
    console.warn('Firebase initialization failed, falling back to mock auth:', error);
    initializeFirebase = false;
  }
} else {
  console.info('Demo mode active: using mock authentication provider. Set VITE_USE_MOCK_AUTH=false to switch back to Firebase later.');
}

const AuthContext = createContext();

const getStoredMockUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem('mock-auth-user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveMockUser = (user) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('mock-auth-user', JSON.stringify(user));
};

const clearStoredMockUser = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('mock-auth-user');
};

const createMockUser = (email, displayName) => ({
  uid: `mock-${Date.now()}`,
  email,
  displayName: displayName || 'Demo User',
  emailVerified: true,
  photoURL: null,
});

export function useAuth(){
  return useContext(AuthContext);
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState(shouldUseMockAuth() ? 'mock' : 'firebase');

  useEffect(()=>{
    if (initializeFirebase && auth) {
      setAuthMode('firebase');
      const unsub = onAuthStateChanged(auth, (u)=>{
        setUser(u);
        setLoading(false);
      });
      return unsub;
    }

    const storedUser = getStoredMockUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser(createMockUser('guest@example.com', 'Guest User'));
      saveMockUser(createMockUser('guest@example.com', 'Guest User'));
    }
    setLoading(false);
    return () => {};
  },[]);

  const login = async (email, password) => {
    if (initializeFirebase && auth) {
      return signInWithEmailAndPassword(auth, email, password);
    }

    const mockUser = createMockUser(email, email.split('@')[0] || 'Demo User');
    setUser(mockUser);
    saveMockUser(mockUser);
    return { user: mockUser };
  };

  const register = async (email, password) => {
    if (initializeFirebase && auth) {
      return createUserWithEmailAndPassword(auth, email, password);
    }

    const mockUser = createMockUser(email, email.split('@')[0] || 'Demo User');
    setUser(mockUser);
    saveMockUser(mockUser);
    return { user: mockUser };
  };

  const logout = async () => {
    if (initializeFirebase && auth) {
      return signOut(auth);
    }

    setUser(null);
    clearStoredMockUser();
    return Promise.resolve();
  };

  const value = useMemo(() => ({ user, loading, authMode, login, register, logout }), [user, loading, authMode]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
