<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gunStore } from '../stores/gun-store';
  import * as d3 from 'd3';
  
  let svg;
  let width = 800;
  let height = 400;
  let simulation;
  let nodes = [];
  let links = [];
  let nodeElements;
  let linkElements;
  let tooltipDiv;
  let mounted = false;
  let timer;
  
  onMount(() => {
    mounted = true;
    initGraph();
    
    // Setup polling to check for data updates
    timer = setInterval(updateGraphData, 2000);
    
    // Handle window resize
    const handleResize = () => {
      if (!mounted) return;
      width = svg.parentElement.clientWidth;
      height = 400;
      updateSimulation();
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  onDestroy(() => {
    mounted = false;
    if (timer) clearInterval(timer);
    if (simulation) simulation.stop();
  });
  
  function initGraph() {
    // Create tooltip
    tooltipDiv = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("text-align", "center")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("background", "#333")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("color", "white");
    
    // Set up SVG
    const svgElement = d3.select(svg)
      .attr("width", width)
      .attr("height", height);
    
    // Initialize empty graph
    linkElements = svgElement.append("g")
      .attr("class", "links")
      .selectAll("line");
    
    nodeElements = svgElement.append("g")
      .attr("class", "nodes")
      .selectAll("circle");
    
    // Initialize simulation
    simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);
    
    updateGraphData();
  }
  
  function updateGraphData() {
    if (!$gunStore.gun || !mounted) return;
    
    // Get nodes and links from Gun database
    // This is simplified - in a real app, you'd traverse the graph structure
    const fetchedNodes = [];
    const fetchedLinks = [];
    
    // Add default nodes
    fetchedNodes.push({ id: 'local', group: 1, name: 'Local Node' });
    
    // Add peers
    Object.keys($gunStore.peers).forEach(peerId => {
      fetchedNodes.push({ id: peerId, group: 2, name: `Peer: ${peerId.substring(0, 8)}...` });
      fetchedLinks.push({ source: 'local', target: peerId, value: 1 });
    });
    
    // Update nodes and links
    nodes = fetchedNodes;
    links = fetchedLinks;
    
    // Update the simulation with new data
    updateSimulation();
  }
  
  function updateSimulation() {
    if (!simulation || !mounted) return;
    
    // Update the simulation with new data
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    
    // Update the simulation dimensions
    simulation.force("center", d3.forceCenter(width / 2, height / 2));
    
    // Update the SVG dimensions
    d3.select(svg)
      .attr("width", width)
      .attr("height", height);
    
    // Update link elements
    linkElements = d3.select(svg).select(".links")
      .selectAll("line")
      .data(links, d => `${d.source.id}-${d.target.id}`);
    
    linkElements.exit().remove();
    
    const linkEnter = linkElements.enter()
      .append("line")
      .attr("stroke-width", d => Math.sqrt(d.value))
      .attr("stroke", "#666");
    
    linkElements = linkEnter.merge(linkElements);
    
    // Update node elements
    nodeElements = d3.select(svg).select(".nodes")
      .selectAll("circle")
      .data(nodes, d => d.id);
    
    nodeElements.exit().remove();
    
    const nodeEnter = nodeElements.enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", d => getNodeColor(d.group))
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", function(event, d) {
        tooltipDiv.transition()
          .duration(200)
          .style("opacity", .9);
        tooltipDiv.html(d.name)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltipDiv.transition()
          .duration(500)
          .style("opacity", 0);
      });
    
    nodeElements = nodeEnter.merge(nodeElements);
    
    // Restart the simulation
    simulation.alpha(0.3).restart();
  }
  
  function ticked() {
    linkElements
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    
    nodeElements
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
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
  
  function getNodeColor(group) {
    const colors = {
      1: '#3b82f6', // Local node (blue)
      2: '#10b981'  // Peers (green)
    };
    return colors[group] || '#9ca3af';
  }
</script>

<div class="graph-container">
  <svg bind:this={svg}></svg>
</div>

<style>
  .graph-container {
    width: 100%;
    height: 400px;
  }
  
  svg {
    width: 100%;
    height: 100%;
    background-color: #2d3748;
    border-radius: 4px;
  }
</style>
