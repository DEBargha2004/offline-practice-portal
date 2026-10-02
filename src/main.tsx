import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Register Service Worker with automatic update detection
registerSW({
  immediate: true,
  onRegisteredSW(_swScriptUrl, registration) {
    if (registration) {
      // Check for updates every 30 minutes in background
      setInterval(() => {
        registration.update().catch(() => {});
      }, 30 * 60 * 1000);

      // Check for updates whenever the tab becomes visible
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    }
  },
})

// Auto-reload the page when a new service worker takes control so users get new assets seamlessly
let isRefreshing = false;
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (!isRefreshing) {
    isRefreshing = true;
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

