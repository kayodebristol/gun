<script lang="ts">
  import { onMount } from 'svelte';
  import { gunStore, stats, peersCount } from '../stores/gun-store';
  import StatsWidget from '../components/StatsWidget.svelte';
  import NodeGraph from '../components/NodeGraph.svelte';
  
  onMount(() => {
    gunStore.initialize();
  });
  
  const statsWidgets = [
    { label: 'Messages Sent', value: $stats.sent, icon: 'arrow-up-right', color: 'primary' },
    { label: 'Messages Received', value: $stats.received, icon: 'arrow-down-left', color: 'success' },
    { label: 'Peers Connected', value: $peersCount, icon: 'people', color: 'info' },
    { label: 'Data Puts', value: $stats.put, icon: 'cloud-upload', color: 'warning' }
  ];
</script>

<div class="container">
  <h1>Deno Gun Dashboard</h1>
  <p class="text-muted">Real-time monitoring and management interface for your Gun node</p>
  
  <div class="row mt-4">
    {#each statsWidgets as widget}
      <div class="col-md-3 mb-4">
        <StatsWidget 
          label={widget.label}
          value={widget.value}
          icon={widget.icon}
          color={widget.color}
        />
      </div>
    {/each}
  </div>
  
  <div class="row mt-4">
    <div class="col-lg-8">
      <div class="card bg-dark">
        <div class="card-header">
          <h5 class="card-title mb-0">Node Graph</h5>
        </div>
        <div class="card-body">
          <NodeGraph />
        </div>
      </div>
    </div>
    
    <div class="col-lg-4">
      <div class="card bg-dark">
        <div class="card-header">
          <h5 class="card-title mb-0">Current Stats</h5>
        </div>
        <div class="card-body">
          <table class="table table-dark">
            <tbody>
              <tr>
                <th>Messages Sent</th>
                <td class="text-right">{$stats.sent}</td>
              </tr>
              <tr>
                <th>Messages Received</th>
                <td class="text-right">{$stats.received}</td>
              </tr>
              <tr>
                <th>Links</th>
                <td class="text-right">{$stats.link}</td>
              </tr>
              <tr>
                <th>Puts</th>
                <td class="text-right">{$stats.put}</td>
              </tr>
              <tr>
                <th>Gets</th>
                <td class="text-right">{$stats.get}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
