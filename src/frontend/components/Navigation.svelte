<script lang="ts">
  import { push, location } from 'npm:svelte-spa-router@4.0.0';
  import { writable } from 'npm:svelte@5.0.0-next.1/store';

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/graph', label: 'Graph View', icon: '🔍' },
    { path: '/data', label: 'Data Explorer', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  // Theme store
  const darkMode = writable(window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Theme toggle
  function toggleTheme() {
    darkMode.update(dark => !dark);
  }

  // Update theme class
  $: document.documentElement.classList.toggle('dark', $darkMode);
</script>

<nav class="navigation">
  <div class="nav-header">
    <a href="/" on:click|preventDefault={() => push('/')} class="logo">
      DenoGun
    </a>
    <button class="theme-toggle" on:click={toggleTheme}>
      {$darkMode ? '☀️' : '🌙'}
    </button>
  </div>

  <div class="nav-items">
    {#each navItems as { path, label, icon }}
      <a
        href={path}
        class="nav-item"
        class:active={$location === path}
        on:click|preventDefault={() => push(path)}
      >
        <span class="icon">{icon}</span>
        <span class="label">{label}</span>
      </a>
    {/each}
  </div>

  <div class="nav-footer">
    <p class="version">v0.1.0</p>
  </div>
</nav>

<style>
  .navigation {
    width: 240px;
    height: 100vh;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }

  .nav-header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--primary);
    text-decoration: none;
  }

  .theme-toggle {
    padding: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    background: var(--surface);
    cursor: pointer;
    transition: background 0.2s;
  }

  .theme-toggle:hover {
    background: var(--surface-hover);
  }

  .nav-items {
    flex: 1;
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text);
    text-decoration: none;
    transition: all 0.2s;
  }

  .nav-item:hover {
    background: var(--surface-hover);
  }

  .nav-item.active {
    background: var(--primary);
    color: white;
  }

  .icon {
    font-size: 1.25rem;
  }

  .nav-footer {
    padding: 1rem;
    border-top: 1px solid var(--border);
    text-align: center;
  }

  .version {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  @media (max-width: 640px) {
    .navigation {
      width: 100%;
      height: auto;
      border-right: none;
      border-bottom: 1px solid var(--border);
    }

    .nav-items {
      flex-direction: row;
      padding: 0.5rem;
      overflow-x: auto;
    }

    .nav-item {
      padding: 0.5rem;
      flex-direction: column;
      gap: 0.25rem;
      text-align: center;
    }

    .label {
      font-size: 0.75rem;
    }

    .nav-footer {
      display: none;
    }
  }
</style> 