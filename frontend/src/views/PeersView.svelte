<script lang="ts">
  import { onMount } from 'svelte';
  import { gunStore } from '../stores/gun-store';
  import PeerList from '../components/PeerList.svelte';
  import PeerNetwork from '../components/PeerNetwork.svelte';
  
  onMount(() => {
    if (!$gunStore.gun) {
      gunStore.initialize();
    }
  });
</script>

<div class="container">
  <h1>Peer Connections</h1>
  <p class="text-muted">View and manage connected peers in your Gun network</p>
  
  <div class="row mt-4">
    <div class="col-lg-5">
      <div class="card bg-dark">
        <div class="card-header">
          <h5 class="card-title mb-0">Connected Peers</h5>
        </div>
        <div class="card-body">
          <PeerList />
        </div>
      </div>
    </div>
    
    <div class="col-lg-7">
      <div class="card bg-dark">
        <div class="card-header">
          <h5 class="card-title mb-0">Network Visualization</h5>
        </div>
        <div class="card-body">
          <PeerNetwork />
        </div>
      </div>
    </div>
  </div>
</div>
