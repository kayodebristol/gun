<script>
  import { push } from 'svelte-spa-router';
</script>

<div class="container text-center py-5">
  <h1 class="display-1">404</h1>
  <h2>Page Not Found</h2>
  <p class="lead text-muted mt-3">
    The page you're looking for doesn't exist or has been moved.
  </p>
  <button class="btn btn-primary mt-4" on:click={() => push('/')}>
    Back to Dashboard
  </button>
</div>
