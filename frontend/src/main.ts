// Frontend entry point
import App from './App.svelte';
import './app.css';

// Initialize Gun with WebSocket support
import Gun from '../../gun-esm.js';
import type { GunConstructor } from '../../gun-esm.d.ts';
import '../../sea-esm.js';

// Environment configuration
const getEnvironment = () => {
  // Default values
  const defaults = {
    WS_URL: 'ws://localhost:8765/gun',
    DEBUG: false,
    PROD: false
  };

  // Try to get values from Vite's environment
  try {
    return {
      WS_URL: (window as any)?.__VITE_GUN_WS_URL || defaults.WS_URL,
      DEBUG: (window as any)?.__DEV__ || defaults.DEBUG,
      PROD: (window as any)?.__PROD__ || defaults.PROD
    };
  } catch {
    return defaults;
  }
};

const ENV = getEnvironment();

// Gun configuration with error handling
const createGunInstance = (): ReturnType<GunConstructor> => {
  try {
    const gun = Gun({
      peers: [ENV.WS_URL],
      localStorage: false,
      radisk: true,
      memory: true,
      debug: ENV.DEBUG,
    });

    // Monitor connection status
    gun.on('hi', (peer: string) => {
      console.info(`Connected to peer: ${peer}`);
    });

    gun.on('bye', (peer: string) => {
      console.info(`Disconnected from peer: ${peer}`);
    });

    // Handle errors
    gun.on('error', (error: Error) => {
      console.error('Gun error:', error);
    });

    return gun;
  } catch (error) {
    console.error('Failed to initialize Gun:', error);
    throw error;
  }
};

// Initialize app with error boundary
const initializeApp = async () => {
  try {
    // Wait for DOM to be ready
    if (document.readyState !== 'complete') {
      await new Promise<void>(resolve => {
        window.addEventListener('load', () => resolve(), { once: true });
      });
    }

    // Create Gun instance
    const gun = createGunInstance();

    // Create Svelte app
    const target = document.getElementById('app') || document.body;
    const app = new App({
      target,
      props: { gun },
      intro: true
    });

    // Register service worker if supported
    if ('serviceWorker' in navigator && ENV.PROD) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.info('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause non-essential operations when tab is hidden
        app.$set({ isActive: false });
      } else {
        // Resume operations when tab is visible
        app.$set({ isActive: true });
      }
    });

    return app;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Show error UI
    document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        font-family: system-ui;
      ">
        <h1>Failed to load application</h1>
        <p>Please try refreshing the page</p>
        ${ENV.DEBUG ? `<pre>${error instanceof Error ? error.stack : String(error)}</pre>` : ''}
      </div>
    `;
    throw error;
  }
};

export default initializeApp();
