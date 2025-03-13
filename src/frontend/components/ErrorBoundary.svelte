<!-- Error boundary component -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { SvelteComponent } from 'svelte';

  // Props
  export let fallback: typeof SvelteComponent | null = null;
  
  // State
  let error: Error | null = null;
  let errorInfo: { componentStack: string } | null = null;
  let isDev = false;

  // Error handler
  const handleError = (event: ErrorEvent) => {
    error = event.error;
    errorInfo = { componentStack: event.error?.stack || '' };
    event.preventDefault();
  };

  // Setup error handlers
  onMount(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      handleError(new ErrorEvent('error', { error: event.reason }));
    });

    // Check if we're in development mode
    try {
      isDev = window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1';
    } catch {
      isDev = false;
    }
  });

  onDestroy(() => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleError);
  });

  // Reset error state
  const resetError = () => {
    error = null;
    errorInfo = null;
  };
</script>

{#if error}
  <div 
    class="error-boundary"
    role="alert"
    in:fade={{ duration: 200 }}
  >
    {#if fallback}
      <svelte:component this={fallback} {error} />
    {:else}
      <div class="error-content">
        <h2>Something went wrong</h2>
        <p class="message">{error.message}</p>
        {#if errorInfo && isDev}
          <pre class="stack">{errorInfo.componentStack}</pre>
        {/if}
        <button 
          class="retry-button"
          on:click={resetError}
        >
          Try Again
        </button>
      </div>
    {/if}
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    padding: var(--space-4);
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    margin: var(--space-4) 0;
  }

  .error-content {
    text-align: center;
  }

  h2 {
    color: var(--error);
    margin: 0 0 var(--space-3);
  }

  .message {
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .stack {
    background: var(--background);
    padding: var(--space-3);
    border-radius: var(--radius);
    font-size: 0.875rem;
    overflow-x: auto;
    margin: 0 0 var(--space-4);
  }

  .retry-button {
    background: var(--primary);
    color: white;
    border: none;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius);
    cursor: pointer;
    transition: background var(--transition);
  }

  .retry-button:hover {
    background: var(--primary-hover);
  }
</style> 