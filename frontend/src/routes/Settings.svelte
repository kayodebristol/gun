{#client}
  <script lang="ts">
    import type { GunConstructor } from '../../../gun-esm.d.ts';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { fade, fly } from 'svelte/transition';

    // Props
    export let gun: ReturnType<GunConstructor>;

    // Settings store
    interface Settings {
      peerCount: number;
      storageUsed: string;
      debugMode: boolean;
      syncInterval: number;
    }

    const createSettingsStore = () => {
      const { subscribe, set, update } = writable<Settings>({
        peerCount: 0,
        storageUsed: '0 KB',
        debugMode: false,
        syncInterval: 5000
      });

      let updateInterval: number;

      onMount(() => {
        // Update peer count
        const updatePeers = () => {
          update(state => ({
            ...state,
            peerCount: Object.keys(gun?._.opt?.peers || {}).length
          }));
        };

        // Update storage usage
        const updateStorage = () => {
          try {
            const storageEstimate = localStorage.length * 16; // Rough estimate
            const size = storageEstimate > 1024 * 1024 
              ? `${(storageEstimate / (1024 * 1024)).toFixed(1)} MB`
              : `${(storageEstimate / 1024).toFixed(1)} KB`;
            
            update(state => ({ ...state, storageUsed: size }));
          } catch {
            update(state => ({ ...state, storageUsed: 'Unknown' }));
          }
        };

        // Initial updates
        updatePeers();
        updateStorage();

        // Set up interval
        updateInterval = setInterval(() => {
          updatePeers();
          updateStorage();
        }, 5000);

        return () => clearInterval(updateInterval);
      });

      return {
        subscribe,
        toggleDebug: () => update(state => ({ ...state, debugMode: !state.debugMode })),
        setSyncInterval: (interval: number) => update(state => ({ ...state, syncInterval: interval }))
      };
    };

    const settings = createSettingsStore();

    // Handle sync interval change
    const handleIntervalChange = (event: Event) => {
      const value = parseInt((event.target as HTMLSelectElement).value);
      settings.setSyncInterval(value);
      
      // Update Gun's sync interval if possible
      if (gun?._.opt) {
        gun._.opt.sync = value;
      }
    };

    // Handle debug mode toggle
    const handleDebugToggle = () => {
      settings.toggleDebug();
      
      // Update Gun's debug mode if possible
      if (gun?._.opt) {
        gun._.opt.debug = !gun._.opt.debug;
      }
    };
  </script>

  <div class="settings" role="main">
    <header class="header" in:fly={{ y: 20, duration: 300 }}>
      <h1>Settings</h1>
      <p>Configure your database settings and view statistics</p>
    </header>

    <div class="settings-grid" in:fly={{ y: 20, duration: 300, delay: 100 }}>
      <!-- Connection Stats -->
      <section class="card">
        <h2>Connection Statistics</h2>
        <div class="stat-grid">
          <div class="stat">
            <span class="label">Connected Peers</span>
            <span class="value">{$settings.peerCount}</span>
          </div>
          <div class="stat">
            <span class="label">Storage Used</span>
            <span class="value">{$settings.storageUsed}</span>
          </div>
        </div>
      </section>

      <!-- Sync Settings -->
      <section class="card">
        <h2>Sync Settings</h2>
        <div class="form-group">
          <label for="sync-interval">Sync Interval</label>
          <select 
            id="sync-interval"
            value={$settings.syncInterval}
            on:change={handleIntervalChange}
          >
            <option value={1000}>1 second</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
          </select>
        </div>
      </section>

      <!-- Debug Settings -->
      <section class="card">
        <h2>Debug Settings</h2>
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              checked={$settings.debugMode}
              on:change={handleDebugToggle}
            />
            Enable Debug Mode
          </label>
          <p class="help-text">
            Show detailed logs and error messages in the console
          </p>
        </div>
      </section>
    </div>
  </div>

  <style>
    .settings {
      display: grid;
      gap: var(--space-6);
    }

    .header {
      text-align: center;
    }

    h1 {
      font-size: 2rem;
      color: var(--text);
      margin: 0 0 var(--space-2);
    }

    .header p {
      color: var(--text-secondary);
      margin: 0;
    }

    .settings-grid {
      display: grid;
      gap: var(--space-4);
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .card {
      background: var(--surface);
      padding: var(--space-4);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    h2 {
      font-size: 1.25rem;
      color: var(--text);
      margin: 0 0 var(--space-4);
    }

    .stat-grid {
      display: grid;
      gap: var(--space-4);
    }

    .stat {
      display: grid;
      gap: var(--space-1);
    }

    .label {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--text);
    }

    .form-group {
      display: grid;
      gap: var(--space-2);
    }

    label {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    select {
      padding: var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--background);
      color: var(--text);
      font: inherit;
      cursor: pointer;
    }

    select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary-transparent);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text);
      font-size: 1rem;
      cursor: pointer;
    }

    input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--background);
      cursor: pointer;
    }

    input[type="checkbox"]:checked {
      background: var(--primary);
      border-color: var(--primary);
    }

    .help-text {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0;
    }

    @media (max-width: 640px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
{/client} 