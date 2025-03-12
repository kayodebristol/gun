<script lang="ts">
  import type { GunConstructor } from '../../../gun-esm.d.ts';
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { fade, fly } from 'svelte/transition';

  // Props
  export let gun: ReturnType<GunConstructor>;

  // Settings store
  interface Settings {
    peers: string[];
    localStorage: boolean;
    debug: boolean;
    radisk: boolean;
    memory: boolean;
    websocket_url: string;
  }

  const settingsStore = writable<Settings>({
    peers: [],
    localStorage: false,
    debug: false,
    radisk: true,
    memory: true,
    websocket_url: 'ws://localhost:8765/gun'
  });

  const error = writable<string | null>(null);
  const success = writable<string | null>(null);

  // Form state for adding peers
  const newPeer = writable('');

  // Load settings from Gun
  async function loadSettings() {
    try {
      gun.get('settings').on((data: any) => {
        if (data && typeof data === 'object' && !data._) {
          settingsStore.set({
            peers: data.peers || [],
            localStorage: data.localStorage || false,
            debug: data.debug || false,
            radisk: data.radisk !== false,
            memory: data.memory !== false,
            websocket_url: data.websocket_url || 'ws://localhost:8765/gun'
          });
        }
      });
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Failed to load settings');
    }
  }

  // Save settings to Gun
  async function saveSettings() {
    try {
      await gun.get('settings').put($settingsStore);
      success.set('Settings saved successfully');
      setTimeout(() => success.set(null), 3000);
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }

  // Add peer
  function addPeer() {
    const peer = $newPeer.trim();
    if (!peer) return;

    try {
      const url = new URL(peer);
      settingsStore.update(s => ({
        ...s,
        peers: [...new Set([...s.peers, peer])]
      }));
      newPeer.set('');
    } catch {
      error.set('Invalid peer URL');
    }
  }

  // Remove peer
  function removePeer(peer: string) {
    settingsStore.update(s => ({
      ...s,
      peers: s.peers.filter(p => p !== peer)
    }));
  }

  // Reset settings
  function resetSettings() {
    settingsStore.set({
      peers: [],
      localStorage: false,
      debug: false,
      radisk: true,
      memory: true,
      websocket_url: 'ws://localhost:8765/gun'
    });
  }

  // Stats
  interface GunStats {
    peers: number;
    outbound: number;
    inbound: number;
    queue: number;
  }

  const gunStore = writable(gun);
  const stats = derived<[typeof gunStore], GunStats>(
    [gunStore],
    ([$gun]) => {
      const opt = ($gun as any)._.opt || {};
      const stats = opt.stats || {};
      return {
        peers: Object.keys(opt.peers || {}).length,
        outbound: stats.outbound || 0,
        inbound: stats.inbound || 0,
        queue: stats.queue || 0
      };
    }
  );

  onMount(() => {
    loadSettings();
  });
</script>

<div class="settings" in:fly={{ y: 20, duration: 300 }}>
  <h1>Settings</h1>

  {#if $error}
    <div class="error" transition:fade>
      {$error}
      <button on:click={() => error.set(null)}>✕</button>
    </div>
  {/if}

  {#if $success}
    <div class="success" transition:fade>
      {$success}
      <button on:click={() => success.set(null)}>✕</button>
    </div>
  {/if}

  <div class="settings-grid">
    <div class="card">
      <h2>Database Configuration</h2>
      
      <div class="form-group">
        <label>
          <input
            type="checkbox"
            bind:checked={$settingsStore.localStorage}
          />
          Enable Local Storage
        </label>
        
        <label>
          <input
            type="checkbox"
            bind:checked={$settingsStore.radisk}
          />
          Enable RAD Storage
        </label>

        <label>
          <input
            type="checkbox"
            bind:checked={$settingsStore.memory}
          />
          Enable In-Memory Cache
        </label>

        <label>
          <input
            type="checkbox"
            bind:checked={$settingsStore.debug}
          />
          Enable Debug Mode
        </label>
      </div>

      <div class="form-group">
        <label for="websocket">WebSocket URL</label>
        <input
          type="url"
          id="websocket"
          bind:value={$settingsStore.websocket_url}
          placeholder="ws://localhost:8765/gun"
        />
      </div>
    </div>

    <div class="card">
      <h2>Peer Management</h2>
      
      <div class="form-group">
        <div class="peer-input">
          <input
            type="url"
            bind:value={$newPeer}
            placeholder="Enter peer URL"
            on:keydown={(e) => e.key === 'Enter' && addPeer()}
          />
          <button on:click={addPeer}>Add Peer</button>
        </div>

        <div class="peers-list">
          {#if $settingsStore.peers.length === 0}
            <p class="empty">No peers configured</p>
          {:else}
            {#each $settingsStore.peers as peer}
              <div class="peer" in:fade>
                <span>{peer}</span>
                <button 
                  class="remove"
                  on:click={() => removePeer(peer)}
                  aria-label="Remove peer"
                >
                  ✕
                </button>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Database Stats</h2>
      
      <div class="stats-grid">
        <div class="stat">
          <span class="label">Connected Peers</span>
          <span class="value">{$stats.peers}</span>
        </div>
        
        <div class="stat">
          <span class="label">Outbound Messages</span>
          <span class="value">{$stats.outbound}</span>
        </div>
        
        <div class="stat">
          <span class="label">Inbound Messages</span>
          <span class="value">{$stats.inbound}</span>
        </div>
        
        <div class="stat">
          <span class="label">Queue Size</span>
          <span class="value">{$stats.queue}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="actions">
    <button class="secondary" on:click={resetSettings}>Reset Settings</button>
    <button class="primary" on:click={saveSettings}>Save Settings</button>
  </div>
</div>

<style>
  .settings {
    display: grid;
    gap: 2rem;
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: bold;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .error {
    background: var(--error-bg);
    color: var(--error);
    padding: 0.75rem;
    border-radius: 0.375rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .success {
    background: var(--success-bg);
    color: var(--success);
    padding: 0.75rem;
    border-radius: 0.375rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .settings-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .card {
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: var(--shadow);
  }

  .form-group {
    display: grid;
    gap: 1rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text);
  }

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
  }

  input[type="url"],
  input[type="text"] {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--background);
    color: var(--text);
    width: 100%;
  }

  .peer-input {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }

  .peers-list {
    display: grid;
    gap: 0.5rem;
  }

  .peer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: var(--background);
    border-radius: 0.375rem;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .empty {
    color: var(--text-secondary);
    text-align: center;
    padding: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  button.primary {
    background: var(--primary);
    color: white;
  }

  button.primary:hover {
    background: var(--primary-hover);
  }

  button.secondary {
    background: var(--surface-hover);
    color: var(--text);
  }

  button.secondary:hover {
    background: var(--border);
  }

  button.remove {
    padding: 0.25rem 0.5rem;
    background: var(--error);
    color: white;
    font-size: 0.875rem;
  }

  button.remove:hover {
    background: var(--error-hover);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .stat {
    display: grid;
    gap: 0.25rem;
    text-align: center;
  }

  .stat .label {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .stat .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  @media (max-width: 640px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style> 