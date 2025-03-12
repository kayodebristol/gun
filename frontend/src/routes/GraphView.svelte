<script lang="ts">
  import type { GunConstructor, GunChain } from '../../../gun-esm.d.ts';
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { writable, derived, get } from 'svelte/store';

  // Props
  export let gun: ReturnType<GunConstructor>;

  // Graph data
  interface Node {
    id: string;
    label: string;
    data: any;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
  }

  interface Link {
    source: string | Node;
    target: string | Node;
    label?: string;
  }

  // Stores
  const nodesStore = writable<Node[]>([]);
  const linksStore = writable<Link[]>([]);
  const nodePositions = writable(new Map<string, { x: number, y: number }>());
  const error = writable<string | null>(null);
  
  // Viewport state with spring animations
  const scale = spring(1, {
    stiffness: 0.1,
    damping: 0.7
  });
  const translate = spring({ x: 0, y: 0 }, {
    stiffness: 0.1,
    damping: 0.7
  });

  // Derived stores for computed values
  const transform = derived(
    [scale, translate],
    ([$scale, $translate]) => `translate(${$translate.x}px, ${$translate.y}px) scale(${$scale})`
  );

  // Viewport dimensions
  let width = 800;
  let height = 600;
  let isDragging = false;
  let dragNode: string | null = null;
  let dragStart = { x: 0, y: 0 };

  // Form state with stores
  const formState = writable({
    nodeLabel: '',
    nodeData: '',
    sourceNode: '',
    targetNode: '',
    linkLabel: ''
  });

  // Layout helpers
  function calculateInitialPosition(id: string) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.min(width, height) / 4;
    return {
      x: width/2 + radius * Math.cos(angle),
      y: height/2 + radius * Math.sin(angle)
    };
  }

  // Event handlers with smooth animations
  function handleMouseDown(event: MouseEvent, nodeId: string) {
    isDragging = true;
    dragNode = nodeId;
    dragStart = {
      x: event.clientX,
      y: event.clientY
    };
  }

  function handleMouseMove(event: MouseEvent) {
    if (isDragging && dragNode) {
      const rect = (event.target as SVGElement).getBoundingClientRect();
      const translateValue = $translate;
      const scaleValue = $scale;
      
      const x = (event.clientX - rect.left - translateValue.x) / scaleValue;
      const y = (event.clientY - rect.top - translateValue.y) / scaleValue;
      
      nodePositions.update(positions => {
        positions.set(dragNode, { x, y });
        return positions;
      });

      // Update node position in Gun
      const node = $nodesStore.find(n => n.id === dragNode);
      if (node) {
        gun.get('nodes').get(node.id).put({ ...node, x, y });
      }
    }
  }

  function handleMouseUp() {
    isDragging = false;
    dragNode = null;
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    scale.set(Math.max(0.1, Math.min(4, $scale * delta)));
  }

  function handlePanStart(event: MouseEvent) {
    if (!dragNode) {
      isDragging = true;
      dragStart = {
        x: event.clientX - $translate.x,
        y: event.clientY - $translate.y
      };
    }
  }

  function handlePanMove(event: MouseEvent) {
    if (isDragging && !dragNode) {
      translate.set({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      });
    }
  }

  // Subscribe to Gun data changes with reactive updates
  function subscribeToData() {
    try {
      const nodesChain = gun.get('nodes');
      const linksChain = gun.get('links');

      nodesChain.map().on((data: any, key: string) => {
        if (data && typeof data === 'object' && !data._) {
          nodesStore.update(nodes => {
            const existingNode = nodes.find(n => n.id === key);
            if (!existingNode) {
              const position = data.x && data.y 
                ? { x: data.x, y: data.y }
                : calculateInitialPosition(key);
              
              nodePositions.update(positions => {
                positions.set(key, position);
                return positions;
              });

              return [...nodes, { 
                id: key, 
                label: data.label || key, 
                data,
                x: position.x,
                y: position.y
              }];
            }
            return nodes;
          });
        }
      });

      linksChain.map().on((data: any, key: string) => {
        if (data && typeof data === 'object' && !data._) {
          linksStore.update(links => {
            const existingLink = links.find(l => 
              l.source === data.source && l.target === data.target
            );
            if (!existingLink && data.source && data.target) {
              return [...links, {
                source: data.source,
                target: data.target,
                label: data.label
              }];
            }
            return links;
          });
        }
      });
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Failed to subscribe to data');
    }
  }

  // Add node
  async function addNode() {
    const { nodeLabel, nodeData } = get(formState);
    if (!nodeLabel) return;

    try {
      const nodeId = `node_${Date.now()}`;
      const position = calculateInitialPosition(nodeId);
      const node = {
        id: nodeId,
        label: nodeLabel,
        data: nodeData ? JSON.parse(nodeData) : {},
        x: position.x,
        y: position.y
      };

      await gun.get('nodes').get(nodeId).put(node);
      formState.update(s => ({ ...s, nodeLabel: '', nodeData: '' }));
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Failed to add node');
    }
  }

  // Add link
  async function addLink() {
    const { sourceNode, targetNode, linkLabel } = get(formState);
    if (!sourceNode || !targetNode) return;

    try {
      const linkId = `link_${Date.now()}`;
      await gun.get('links').get(linkId).put({
        source: sourceNode,
        target: targetNode,
        label: linkLabel
      });
      formState.update(s => ({ ...s, sourceNode: '', targetNode: '', linkLabel: '' }));
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Failed to add link');
    }
  }

  // Reset layout with animation
  function resetLayout() {
    const nodes = $nodesStore;
    nodes.forEach(node => {
      const position = calculateInitialPosition(node.id);
      nodePositions.update(positions => {
        positions.set(node.id, position);
        return positions;
      });
      gun.get('nodes').get(node.id).put({ ...node, x: position.x, y: position.y });
    });
    scale.set(1);
    translate.set({ x: 0, y: 0 });
  }

  // Clear graph with fade out animation
  async function clearGraph() {
    try {
      const nodes = $nodesStore;
      const links = $linksStore;

      // Remove all nodes and links from Gun
      await Promise.all([
        ...nodes.map(node => gun.get('nodes').get(node.id).put(null)),
        ...links.map(link => gun.get('links').get(`${link.source}_${link.target}`).put(null))
      ]);

      nodesStore.set([]);
      linksStore.set([]);
      nodePositions.set(new Map());
    } catch (err) {
      error.set(err instanceof Error ? err.message : 'Failed to clear graph');
    }
  }

  onMount(() => {
    subscribeToData();
  });
</script>

<div class="graph-view">
  <div class="controls">
    <h1>Graph View</h1>
    
    {#if $error}
      <div class="error" transition:fade>
        {$error}
        <button on:click={() => error.set(null)}>✕</button>
      </div>
    {/if}

    <div class="form-grid">
      <div class="form-group">
        <h2>Add Node</h2>
        <input
          type="text"
          placeholder="Node Label"
          bind:value={$formState.nodeLabel}
        />
        <textarea
          placeholder="Node Data (JSON)"
          bind:value={$formState.nodeData}
        ></textarea>
        <button on:click={addNode}>Add Node</button>
      </div>

      <div class="form-group">
        <h2>Add Link</h2>
        <select bind:value={$formState.sourceNode}>
          <option value="">Select Source Node</option>
          {#each $nodesStore as node}
            <option value={node.id}>{node.label}</option>
          {/each}
        </select>
        <select bind:value={$formState.targetNode}>
          <option value="">Select Target Node</option>
          {#each $nodesStore as node}
            <option value={node.id}>{node.label}</option>
          {/each}
        </select>
        <input
          type="text"
          placeholder="Link Label"
          bind:value={$formState.linkLabel}
        />
        <button on:click={addLink}>Add Link</button>
      </div>
    </div>

    <div class="actions">
      <button on:click={resetLayout}>Reset Layout</button>
      <button on:click={clearGraph}>Clear Graph</button>
    </div>
  </div>

  <div class="graph">
    <div bind:clientWidth={width} bind:clientHeight={height}>
      <svg 
        {width}
        {height}
        on:mousedown={handlePanStart}
        on:mousemove={handlePanMove}
        on:mouseup={handleMouseUp}
        on:mouseleave={handleMouseUp}
        on:wheel={handleWheel}
      >
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
          </marker>
        </defs>

        <g style="transform: {$transform}">
          <!-- Links -->
          {#each $linksStore as link}
            {@const sourceId = typeof link.source === 'string' ? link.source : link.source.id}
            {@const targetId = typeof link.target === 'string' ? link.target : link.target.id}
            {@const sourcePos = $nodePositions.get(sourceId)}
            {@const targetPos = $nodePositions.get(targetId)}
            {#if sourcePos && targetPos}
              <g in:fade={{ duration: 200 }}>
                <line 
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  class="link"
                  marker-end="url(#arrowhead)"
                />
                {#if link.label}
                  <text
                    x={(sourcePos.x + targetPos.x) / 2}
                    y={(sourcePos.y + targetPos.y) / 2 - 10}
                    class="link-label"
                  >
                    {link.label}
                  </text>
                {/if}
              </g>
            {/if}
          {/each}

          <!-- Nodes -->
          {#each $nodesStore as node (node.id)}
            {@const pos = $nodePositions.get(node.id)}
            {#if pos}
              <g
                transform="translate({pos.x}, {pos.y})"
                on:mousedown={(e) => handleMouseDown(e, node.id)}
                class="node"
                in:fly={{ y: 20, duration: 200, easing: quintOut }}
              >
                <circle
                  r="20"
                  class:dragging={dragNode === node.id}
                />
                <text
                  dy=".35em"
                  text-anchor="middle"
                >
                  {node.label}
                </text>
              </g>
            {/if}
          {/each}
        </g>
      </svg>
    </div>
  </div>
</div>

<style>
  .graph-view {
    display: grid;
    gap: 2rem;
    padding: 1rem;
  }

  .controls {
    display: grid;
    gap: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: bold;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .error {
    background: var(--error-bg);
    color: var(--error);
    padding: 0.75rem;
    border-radius: 0.375rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .form-group {
    display: grid;
    gap: 0.75rem;
  }

  input,
  select,
  textarea {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--surface);
    color: var(--text);
  }

  textarea {
    min-height: 100px;
    font-family: monospace;
  }

  button {
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: var(--primary-hover);
  }

  .actions {
    display: flex;
    gap: 1rem;
  }

  .graph {
    background: var(--surface);
    border-radius: 0.5rem;
    overflow: hidden;
    min-height: 600px;
  }

  svg {
    width: 100%;
    height: 100%;
  }

  .link {
    stroke: var(--border);
    stroke-width: 1px;
  }

  .link-label {
    fill: var(--text-secondary);
    font-size: 12px;
    text-anchor: middle;
  }

  .node circle {
    fill: var(--primary);
    stroke: var(--primary-hover);
    stroke-width: 2px;
    cursor: grab;
  }

  .node circle.dragging {
    cursor: grabbing;
  }

  .node text {
    fill: white;
    font-size: 12px;
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 