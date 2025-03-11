<script lang="ts">
  import { onMount } from 'svelte';
  import { gunStore } from '../stores/gun-store';
  import JSONTree from 'svelte-json-tree';
  
  let path = '';
  let inputData = '';
  let operation = 'get';
  let result = null;
  let error = null;
  let loading = false;
  let history = [];
  
  onMount(() => {
    if (!$gunStore.gun) {
      gunStore.initialize();
    }
    
    // Load history from localStorage
    const savedHistory = localStorage.getItem('gunApiHistory');
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory).slice(0, 10);
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  });
  
  function saveToHistory(cmd) {
    history = [cmd, ...history].slice(0, 10);
    localStorage.setItem('gunApiHistory', JSON.stringify(history));
  }
  
  function loadFromHistory(cmd) {
    path = cmd.path;
    operation = cmd.operation;
    inputData = cmd.data || '';
  }
  
  async function executeOperation() {
    if (!path) {
      error = "Please enter a path";
      return;
    }
    
    try {
      error = null;
      loading = true;
      result = null;
      
      if (!$gunStore.gun) {
        throw new Error("Gun is not initialized");
      }
      
      // Create a node reference
      const node = path.split('/').reduce((acc, part) => {
        return part ? acc.get(part) : acc;
      }, $gunStore.gun);
      
      switch (operation) {
        case 'get':
          node.once((data) => {
            result = data;
            loading = false;
            saveToHistory({ path, operation });
          });
          break;
          
        case 'put':
          try {
            const data = JSON.parse(inputData);
            node.put(data);
            result = { success: true, operation: 'put', data };
            loading = false;
            saveToHistory({ path, operation, data: inputData });
          } catch (e) {
            throw new Error(`Invalid JSON: ${e.message}`);
          }
          break;
          
        case 'set':
          try {
            const data = JSON.parse(inputData);
            node.set(data);
            result = { success: true, operation: 'set', data };
            loading = false;
            saveToHistory({ path, operation, data: inputData });
          } catch (e) {
            throw new Error(`Invalid JSON: ${e.message}`);
          }
          break;
          
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (err) {
      error = err.message;
      loading = false;
    }
  }
</script>

<div class="container">
  <h1>GUN API Console</h1>
  <p class="text-muted">Interact with your Gun database using the API</p>
  
  <div class="row mt-4">
    <div class="col-lg-8">
      <div class="card bg-dark">
        <div class="card-header">
          <h5 class="card-title mb-0">Execute Command</h5>
        </div>
        <div class="card-body">
          <form on:submit|preventDefault={executeOperation}>
            <div class="mb-3">
              <label for="operation" class="form-label">Operation</label>
              <select class="form-select bg-dark text-light" id="operation" bind:value={operation}>
                <option value="get">GET</option>
                <option value="put">PUT</option>
                <option value="set">SET</option>
              </select>
            </div>
            
            <div class="mb-3">
              <label for="path" class="form-label">Path</label>
              <input 
                type="text"
                class="form-control bg-dark text-light"
                id="path"
                placeholder="e.g., users/123"
                bind:value={path}
                required
              />
              <div class="form-text">The path to the data in your Gun graph</div>
            </div>
            
            {#if operation === 'put' || operation === 'set'}
              <div class="mb-3">
                <label for="inputData" class="form-label">Data (JSON)</label>
                <textarea
                  class="form-control bg-dark text-light"
                  id="inputData"
                  rows="5"
                  placeholder='{"name": "John", "age": 30}'
                  bind:value={inputData}
                  required
                ></textarea>
                <div class="form-text">Valid JSON data to store</div>
              </div>
            {/if}
            
            <button
              type="submit"
              class="btn btn-primary"
              disabled={loading || !$gunStore.gun}
            >
              {loading ? 'Executing...' : 'Execute'}
            </button>
          </form>
          
          {#if error}
            <div class="alert alert-danger mt-3">
              {error}
            </div>
          {/if}
        </div>
      </div>
      
      {#if result !== null}
        <div class="card bg-dark mt-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Result</h5>
          </div>
          <div class="card-body">
            <JSONTree value={result} />
          </div>
        </div>
      {/if}
    </div>
    
    <div class="col-lg-4">
      <div class="card bg-dark">
        <div class="card-header">
          <h5 class="card-title mb-0">Command History</h5>
        </div>
        <div class="card-body p-0">
          {#if history.length === 0}
            <div class="p-3 text-muted">
              No command history yet
            </div>
          {:else}
            <ul class="list-group list-group-flush">
              {#each history as cmd, i}
                <li class="list-group-item bg-dark text-light border-secondary">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="badge bg-primary me-2">{cmd.operation}</span>
                      <span>{cmd.path}</span>
                    </div>
                    <button
                      class="btn btn-sm btn-outline-light"
                      on:click={() => loadFromHistory(cmd)}
                    >
                      Load
                    </button>
                  </div>
                  {#if cmd.data}
                    <div class="mt-2">
                      <small class="text-muted">{cmd.data.length > 30 ? cmd.data.substring(0, 30) + '...' : cmd.data}</small>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
