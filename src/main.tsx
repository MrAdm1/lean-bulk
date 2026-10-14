import { createRoot } from 'react-dom/client';
import '@fontsource-variable/outfit';
import '@fontsource-variable/manrope';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);

// Offline support. When a new version is deployed, the app reloads once to pick it up.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode unavailable */ }); });
}
