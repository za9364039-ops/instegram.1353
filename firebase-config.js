// Firebase Configuration and Initialization Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyClgG2eurjX9I4nMUYxq8M6ldKwpjIwiBM",
  authDomain: "ahmed-ua.firebaseapp.com",
  projectId: "ahmed-ua",
  storageBucket: "ahmed-ua.firebasestorage.app",
  messagingSenderId: "983814721369",
  appId: "1:983814721369:web:88c0a82839968068e9c648",
  measurementId: "G-CYGDGFHQE3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.info("Firebase Analytics (local or offline environment):", error.message);
}

export { analytics };

window.firebaseApp = app;
window.firebaseAnalytics = analytics;
window.firebaseConfig = firebaseConfig;

console.log("Firebase successfully connected to ahmed-ua:", app.name);
