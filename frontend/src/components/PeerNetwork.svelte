<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gunStore } from '../stores/gun-store';
  import * as d3 from 'd3';
  
  let svg;
  let width = 600;
  let height = 400;
  let simulation;
  let nodes = [];
  let links = [];
  let nodeElements;
  let linkElements;
  let labelElements;
  let timer;
  
  onMount(() => {
    initNetwork();
    timer = setInterval(() => updateNetwork(), 2000);
    
    // Resize handler
    const handleResize = () => {
      if (svg) {
        width = svg.parentElement.clientWidth;
        if (simulation) {
          simulation.force("center", d3.forceCenter(width / 2, height / 2));
          simulation.alpha(0.3).restart();
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100); // Initial resize
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  onDestroy(() => {
    if (timer) clearInterval(timer);
    if (simulation) simulation.stop();
  });
  
  function initNetwork() {
    const svgElement = d3.select(svg)
      .attr("width", width)
      .attr("height", height);
    
    // Create a group for links
    svgElement.append("g").attr("class", "links");
    
    // Create a group for nodes
    svgElement.append("g").attr("class", "nodes");
    
    // Create a group for labels
    svgElement.append("g").attr("class", "labels");
    
    // Initialize simulation
    simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);
    
    updateNetwork();
  }
  
  function updateNetwork() {
    // Generate nodes and links from current peers
    const generatedNodes = [];
    const generatedLinks = [];
    
    // Add self node
    generatedNodes.push({
      id: "self",
      name: "This Node",
      group: 1
    });
    
    // Add peer nodes and links
    Object.entries($gunStore.peers).forEach(([id, peer]) => {
      generatedNodes.push({
        id,
        // @ts-ignore - Peer structure from Gun
        name: peer.url || id.substring(0, 8),
        group: 2
      });
      
      generatedLinks.push({
        source: "self",
        target: id,
        value: 1
      });
    });
    
    // Update nodes and links
    nodes = generatedNodes;
    links = generatedLinks;
    
    // Update visualization
    updateVisualization();
  }
  
  function updateVisualization() {
    if (!svg) return;
    
    const svgElement = d3.select(svg);
    
    // Update link elements
    linkElements = svgElement.select(".links")
      .selectAll("line")
      .data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
    
    linkElements.exit().remove();
    
    const newLinks = linkElements.enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", d => Math.sqrt(d.value));
    
    linkElements = newLinks.merge(linkElements);
    
    // Update node elements
    nodeElements = svgElement.select(".nodes")
      .selectAll("circle")
      .data(nodes, d => d.id);
    
    nodeElements.exit().remove();
    
    const newNodes = nodeElements.enter()
      .append("circle")
      .attr("r", d => d.group === 1 ? 12 : 8)
      .attr("fill", d => d.group === 1 ? "#3b82f6" : "#10b981")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    nodeElements = newNodes.merge(nodeElements);
    
    // Update label elements
    labelElements = svgElement.select(".labels")
      .selectAll("text")
      .data(nodes, d => d.id);
    
    labelElements.exit().remove();
    
    const newLabels = labelElements.enter()
      .append("text")
      .text(d => d.name)
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4)
      .attr("fill", "white");
    
    labelElements = newLabels.merge(labelElements);
    
    // Update simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(0.3).restart();
  }
  
  function ticked() {
    if (linkElements) {
      linkElements
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    }
    
    if (nodeElements) {
      nodeElements
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }
    
    if (labelElements) {
      labelElements
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    }
  }
  
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
</script>

<svg bind:this={svg} width={width} height={height}></svg>

<style>
  svg {
    width: 100%;
    height: 100%;
    background-color: #2d3748;
    border-radius: 4px;
  }
</style>
