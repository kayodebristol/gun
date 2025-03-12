<script lang="ts">
  import type { GunConstructor } from '../../../gun-esm.d.ts';
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { fade, fly } from 'svelte/transition';

  // Props
  export let gun: ReturnType<GunConstructor>;

  // Connection store
  interface ConnectionState {
    isConnected: boolean;
    peers: number;
    lastSync: Date | null;
  }

  const createConnectionStore = () => {
    const { subscribe, set, update } = writable<ConnectionState>({
      isConnected: false,
      peers: 0,
      lastSync: null
    });

    let updateInterval: number;

    onMount(() => {
      const onHi = (peer: string) => {
        update((state: ConnectionState) => ({ ...state, isConnected: true }));
      };

      const onBye = (peer: string) => {
        update((state: ConnectionState) => ({ ...state, isConnected: false }));
      };

      const updatePeers = () => {
        update((state: ConnectionState) => ({
          ...state,
          peers: Object.keys(gun?._.opt?.peers || {}).length,
          lastSync: new Date()
        }));
      };

      // Initial update
      updatePeers();

      // Set up listeners
      gun.on('hi', onHi);
      gun.on('bye', onBye);

      // Update peers count periodically
      updateInterval = setInterval(updatePeers, 5000);

      return () => {
        gun.off('hi', onHi);
        gun.off('bye', onBye);
        clearInterval(updateInterval);
      };
    });

    return {
      subscribe
    };
  };

  const connection = createConnectionStore();

  // Quick actions with metadata
  const actions = [
    {
      label: 'View Graph',
      icon: '🔍',
      path: '/graph',
      description: 'Visualize your data relationships',
      color: 'primary'
    },
    {
      label: 'Explore Data',
      icon: '📊',
      path: '/explorer',
      description: 'Browse and modify your data',
      color: 'secondary'
    },
    {
      label: 'Configure Settings',
      icon: '⚙️',
      path: '/settings',
      description: 'Customize your database settings',
      color: 'accent'
    }
  ] as const;

  // Getting started steps
  const steps = [
    {
      title: 'Visualize Data',
      description: 'Use the Graph View to visualize your data relationships',
      icon: '🔍'
    },
    {
      title: 'Explore & Modify',
      description: 'Navigate the Data Explorer to browse and modify your data',
      icon: '📊'
    },
    {
      title: 'Configure',
      description: 'Configure your database settings in the Settings panel',
      icon: '⚙️'
    },
    {
      title: 'Connect',
      description: 'Connect with peers to start sharing data',
      icon: '🔗'
    }
  ] as const;

  // Navigation handler using native history API
  const navigate = (path: string) => {
    const event = new CustomEvent('navigate', { detail: { path } });
    window.dispatchEvent(event);
  };
</script>

<div class="home" role="main">
  <section class="hero" in:fly={{ y: 20, duration: 300 }}>
    <h1>Welcome to DenoGun</h1>
    <p>A modern, distributed graph database powered by Deno and Gun</p>
  </section>

  <section class="status-grid" in:fly={{ y: 20, duration: 300, delay: 100 }}>
    <div class="status-card">
      <h2>Database Status</h2>
      <div class="status-items">
        <div class="status-item">
          <span class="label">Connection:</span>
          <span class="value" class:connected={$connection.isConnected}>
            {$connection.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div class="status-item">
          <span class="label">Peers:</span>
          <span class="value peers">{$connection.peers}</span>
        </div>
        {#if $connection.lastSync}
          <div class="status-item">
            <span class="label">Last Update:</span>
            <span class="value time">
              {$connection.lastSync.toLocaleTimeString()}
            </span>
          </div>
        {/if}
      </div>
    </div>

    <div class="actions-card">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        {#each actions as { label, icon, path, description, color }}
          <button 
            class="action-button {color}"
            on:click={() => navigate(path)}
            aria-label={description}
          >
            <span class="icon" aria-hidden="true">{icon}</span>
            <span class="label">{label}</span>
          </button>
        {/each}
      </div>
    </div>
  </section>

  <section class="guide-card" in:fly={{ y: 20, duration: 300, delay: 200 }}>
    <h2>Getting Started</h2>
    <div class="guide-content">
      <p>
        DenoGun is a feature-complete, local-first, secure distributed graph database 
        with a web-based frontend. Here's how to get started:
      </p>
      <ol class="steps">
        {#each steps as { title, description, icon }, i}
          <li class="step" in:fade={{ delay: 300 + i * 100 }}>
            <span class="step-icon" aria-hidden="true">{icon}</span>
            <div class="step-content">
              <strong>{title}</strong>
              <span>{description}</span>
            </div>
          </li>
        {/each}
      </ol>
    </div>
  </section>
</div>

<style>
  .home {
    display: grid;
    gap: 2rem;
    padding: 2rem;
  }

  .hero {
    text-align: center;
  }

  .hero h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--text);
  }

  .hero p {
    font-size: 1.25rem;
    color: var(--text-secondary);
  }

  .status-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .status-card,
  .actions-card,
  .guide-card {
    background: var(--surface);
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: var(--shadow);
  }

  h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--text);
  }

  .status-items {
    display: grid;
    gap: 1rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .label {
    color: var(--text-secondary);
  }

  .value {
    font-weight: 500;
  }

  .value.connected {
    color: var(--success);
  }

  .value.peers {
    color: var(--primary);
  }

  .value.time {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .actions-grid {
    display: grid;
    gap: 1rem;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.375rem;
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-button:hover {
    transform: translateY(-1px);
  }

  .action-button.primary {
    background: var(--primary);
    color: white;
  }

  .action-button.secondary {
    background: var(--secondary);
    color: white;
  }

  .action-button.accent {
    background: var(--accent);
    color: white;
  }

  .guide-content {
    color: var(--text);
  }

  .steps {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
    display: grid;
    gap: 1rem;
  }

  .step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .step-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .step-content {
    display: grid;
    gap: 0.25rem;
  }

  .step-content strong {
    color: var(--text);
  }

  .step-content span {
    color: var(--text-secondary);
  }

  @media (max-width: 640px) {
    .status-grid {
      grid-template-columns: 1fr;
    }

    .hero h1 {
      font-size: 2rem;
    }

    .hero p {
      font-size: 1.125rem;
    }
  }
</style> 