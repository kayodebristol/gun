<script lang="ts">
  import { push, location } from 'svelte-spa-router';
  import { connectionStatus, peersCount } from '../stores/gun-store';
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/peers', label: 'Peers' },
    { path: '/explorer', label: 'Data Explorer' },
    { path: '/console', label: 'API Console' }
  ];
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" href="/">
      Deno Gun
    </a>
    
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto">
        {#each navItems as item}
          <li class="nav-item">
            <a 
              class="nav-link {$location === item.path ? 'active' : ''}" 
              href={item.path}
              on:click|preventDefault={() => push(item.path)}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
      
      <div class="d-flex align-items-center">
        <div class="me-3">
          <span class="badge bg-{$connectionStatus === 'connected' ? 'success' : 'danger'}">
            {$connectionStatus}
          </span>
          {#if $peersCount > 0}
            <span class="badge bg-info ms-2">
              {$peersCount} peer{$peersCount !== 1 ? 's' : ''}
            </span>
          {/if}
        </div>
      </div>
    </div>
  </div>
</nav>
