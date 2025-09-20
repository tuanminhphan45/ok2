"use client";

// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbDFiug79OvCZjcv6LjwZ0pXfxJQXaaAc",
  authDomain: "test-f2c95.firebaseapp.com",
  projectId: "test-f2c95",
  storageBucket: "test-f2c95.firebasestorage.app",
  messagingSenderId: "941350922378",
  appId: "1:941350922378:web:2151b80726e28f0322a573",
};

// Initialize Firebase
let app;
if (typeof window !== "undefined") {
  console.log("Initializing Firebase...");
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  console.log("Firebase app initialized:", app.name);
} else {
  console.log("Server-side, skipping Firebase init");
  app = null;
}

// Export Firebase services
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

console.log("Firebase services:", { db: !!db, auth: !!auth });

// Anonymous authentication helper
export async function ensureAnonAuth() {
  if (!auth) return;
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}
