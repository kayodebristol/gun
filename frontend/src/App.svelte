<script lang="ts">
  import type { GunConstructor } from '../../gun-esm.d.ts';
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';

  // Routes
  import Home from './routes/Home.svelte';
  import GraphView from './routes/GraphView.svelte';
  import DataExplorer from './routes/DataExplorer.svelte';
  import Settings from './routes/Settings.svelte';
  import NotFound from './routes/NotFound.svelte';
  import ErrorBoundary from './components/ErrorBoundary.svelte';

  // Props
  export let gun: ReturnType<GunConstructor>;

  // Navigation store with history API integration
  const createRouter = () => {
    const { subscribe, set } = writable(window.location.pathname);

    const navigate = (path: string) => {
      window.history.pushState({}, '', path);
      set(path);
    };

    // Handle browser back/forward
    const handlePopState = () => set(window.location.pathname);
    
    onMount(() => {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    });

    return {
      subscribe,
      navigate,
      back: () => window.history.back(),
      forward: () => window.history.forward()
    };
  };

  const router = createRouter();

  // Navigation items with metadata
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠', description: 'Return to home page' },
    { path: '/graph', label: 'Graph View', icon: '🔍', description: 'View data as a graph' },
    { path: '/explorer', label: 'Data Explorer', icon: '📊', description: 'Explore and edit data' },
    { path: '/settings', label: 'Settings', icon: '⚙️', description: 'Configure application settings' },
  ];

  // Theme store with system preference detection
  const createTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const { subscribe, set, update } = writable(prefersDark.matches);

    onMount(() => {
      const handler = (e: MediaQueryListEvent) => set(e.matches);
      prefersDark.addEventListener('change', handler);
      return () => prefersDark.removeEventListener('change', handler);
    });

    return {
      subscribe,
      toggle: () => update(dark => !dark)
    };
  };

  const darkMode = createTheme();

  // Reactive theme class
  $: themeClass = $darkMode ? 'dark' : 'light';

  // Current route component
  $: currentComponent = {
    '/': Home,
    '/graph': GraphView,
    '/explorer': DataExplorer,
    '/settings': Settings
  }[$router] || NotFound;
</script>

<svelte:head>
  <title>DenoGun - {navItems.find(item => item.path === $router)?.label || '404'}</title>
</svelte:head>

<ErrorBoundary>
  <div class="app {themeClass}" role="application">
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <div class="nav-container">
        <div class="nav-content">
          <a href="/" class="logo" on:click|preventDefault={() => router.navigate('/')}>
            <strong>DenoGun</strong>
          </a>
          <div class="nav-items" role="menubar">
            {#each navItems as { path, label, icon, description }}
              <button 
                class="nav-button"
                class:active={$router === path}
                on:click={() => router.navigate(path)}
                role="menuitem"
                aria-current={$router === path}
                aria-label={description}
              >
                <span class="icon" aria-hidden="true">{icon}</span>
                <span class="label">{label}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </nav>

    <main class="main" role="main">
      <svelte:component this={currentComponent} {gun} />
    </main>

    <footer class="footer" role="contentinfo">
      <div class="footer-content">
        <p>Powered by Deno, Gun, and Svelte</p>
        <button 
          class="theme-toggle" 
          on:click={() => darkMode.toggle()}
          aria-label="Toggle dark mode"
        >
          {$darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </footer>
  </div>
</ErrorBoundary>

<style>
  /* CSS Custom Properties for theming */
  .app {
    --primary-color: #4a9eff;
    --primary-hover: #2b7cd9;
    --background: #ffffff;
    --text: #1a1a1a;
    --surface: #ffffff;
    --surface-hover: #f5f5f5;
    --border: #e5e5e5;
    --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .app.dark {
    --primary-color: #60a5fa;
    --primary-hover: #3b82f6;
    --background: #1a1a1a;
    --text: #ffffff;
    --surface: #2d2d2d;
    --surface-hover: #3d3d3d;
    --border: #404040;
    --shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  /* Layout */
  .app {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: var(--background);
    color: var(--text);
  }

  /* Navigation */
  .nav {
    background: var(--surface);
    box-shadow: var(--shadow);
    border-bottom: 1px solid var(--border);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-3);
  }

  .nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4rem;
  }

  .logo {
    font-size: 1.5rem;
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.2s;
  }

  .logo:hover {
    color: var(--primary-hover);
  }

  .nav-items {
    display: flex;
    gap: var(--space-3);
  }

  .nav-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: none;
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-button:hover {
    background: var(--surface-hover);
  }

  .nav-button.active {
    background: var(--primary-color);
    color: white;
  }

  .icon {
    font-size: 1.25rem;
  }

  /* Main content */
  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-5) var(--space-3);
    width: 100%;
  }

  /* Footer */
  .footer {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: var(--space-3);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .theme-toggle {
    padding: var(--space-2);
    border: none;
    border-radius: var(--radius);
    background: var(--surface);
    cursor: pointer;
    transition: background 0.2s;
  }

  .theme-toggle:hover {
    background: var(--surface-hover);
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .nav-button .label {
      display: none;
    }

    .nav-button {
      padding: var(--space-2);
    }
  }
</style>
