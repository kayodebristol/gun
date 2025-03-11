<script lang="ts">
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import Navbar from './components/Navbar.svelte';
  import { gunStore } from './stores/gun-store';
  
  // Routes for the application
  const routes = {
    '/': wrap({
      component: import('./views/Dashboard.svelte')
    }),
    '/peers': wrap({
      component: import('./views/PeersView.svelte')
    }),
    '/explorer': wrap({
      component: import('./views/DataExplorer.svelte')
    }),
    '/console': wrap({
      component: import('./views/ApiConsole.svelte')
    }),
    '*': wrap({
      component: import('./views/NotFound.svelte')
    })
  };
</script>

<Navbar />

<main class="container mt-4">
  <Router {routes} />
</main>

<style>
  main {
    padding: 1rem;
    max-width: 1400px;
    margin: 0 auto;
  }
</style>
