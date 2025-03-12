<script lang="ts">
  import { fly } from 'svelte/transition';
</script>

<div class="not-found" in:fly={{ y: 20, duration: 300 }}>
  <div class="content">
    <h1>404</h1>
    <p class="message">Page Not Found</p>
    <p class="description">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div class="actions">
      <button 
        class="primary"
        on:click={() => window.history.back()}
      >
        Go Back
      </button>
      <a 
        href="/"
        class="secondary"
        on:click|preventDefault={() => {
          const event = new CustomEvent('navigate', { detail: { path: '/' } });
          window.dispatchEvent(event);
        }}
      >
        Return Home
      </a>
    </div>
  </div>
</div>

<style>
  .not-found {
    display: grid;
    place-items: center;
    min-height: 60vh;
    padding: 2rem;
  }

  .content {
    text-align: center;
    max-width: 400px;
  }

  h1 {
    font-size: 6rem;
    font-weight: bold;
    color: var(--primary);
    line-height: 1;
    margin: 0;
    opacity: 0.5;
  }

  .message {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
    margin: 1rem 0;
  }

  .description {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  button,
  a {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
  }

  .primary {
    background: var(--primary);
    color: white;
  }

  .primary:hover {
    background: var(--primary-hover);
  }

  .secondary {
    background: var(--surface);
    color: var(--text);
  }

  .secondary:hover {
    background: var(--surface-hover);
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 4rem;
    }

    .message {
      font-size: 1.25rem;
    }

    .actions {
      flex-direction: column;
    }
  }
</style> 