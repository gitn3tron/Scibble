import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// CRITICAL FIX: Remove StrictMode to prevent duplicate effects during development
// StrictMode intentionally double-invokes effects to help detect side effects
// This was causing the duplicate join-room events
createRoot(document.getElementById('root')!).render(
  <App />
);