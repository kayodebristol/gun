<script lang="ts">
  import { fade, fly } from 'svelte/transition';
</script>

<div class="not-found" in:fade={{ duration: 200 }}>
  <div class="content" in:fly={{ y: 20, duration: 300 }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" class="home-link" on:click|preventDefault={() => window.history.pushState({}, '', '/')}>
      Return Home
    </a>
  </div>
</div>

<style>
  .not-found {
    display: grid;
    place-items: center;
    min-height: 60vh;
    text-align: center;
    padding: var(--space-4);
  }

  .content {
    max-width: 32rem;
  }

  h1 {
    font-size: 2rem;
    color: var(--text);
    margin: 0 0 var(--space-3);
  }

  p {
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .home-link {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    background: var(--primary);
    color: white;
    text-decoration: none;
    border-radius: var(--radius);
    transition: background var(--transition);
  }

  .home-link:hover {
    background: var(--primary-hover);
  }
</style> 