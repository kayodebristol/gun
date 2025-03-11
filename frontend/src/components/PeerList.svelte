<script lang="ts">
  import { gunStore } from '../stores/gun-store';
  
  // Computed value to transform peers object to array
  $: peerArray = Object.entries($gunStore.peers).map(([id, peer]) => ({
    id,
    // @ts-ignore - Peer object structure from Gun
    url: peer.url || 'Unknown',
    // @ts-ignore - Calculate time connected
    connectedAt: peer.time ? new Date(peer.time) : new Date(),
    // Additional peer properties could be added here
  }));
</script>

{#if peerArray.length === 0}
  <div class="alert alert-info">
    No peers are currently connected to this node.
  </div>
{:else}
  <div class="table-responsive">
    <table class="table table-dark table-hover">
      <thead>
        <tr>
          <th>Peer ID</th>
          <th>URL</th>
          <th>Connected</th>
        </tr>
      </thead>
      <tbody>
        {#each peerArray as peer}
          <tr>
            <td title={peer.id}>{peer.id.substring(0, 8)}...</td>
            <td>{peer.url}</td>
            <td>{formatTime(peer.connectedAt)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<script context="module">
  function formatTime(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return `${diffSec}s ago`;
    } else if (diffSec < 3600) {
      return `${Math.floor(diffSec / 60)}m ago`;
    } else if (diffSec < 86400) {
      return `${Math.floor(diffSec / 3600)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
</script>
