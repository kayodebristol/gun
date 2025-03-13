import { assertEquals, assertExists } from "$std/testing/asserts.ts";
import { describe, it, beforeEach, afterEach } from "$std/testing/bdd.ts";
import { GraphStore } from "../../src/frontend/lib/stores/graph-store.ts";
import Gun from "../../src/core/gun-esm.js";
import { get } from "npm:svelte@5.0.0-next.1/store";
import type { StoreState, Node, Link } from "../../src/frontend/lib/stores/graph-store.ts";

describe("GraphStore", () => {
  let graphStore: GraphStore;
  let gun: ReturnType<typeof Gun>;

  beforeEach(() => {
    // Initialize a new Gun instance for each test with minimal configuration
    gun = Gun({
      localStorage: false,
      radisk: false,
      file: false,
      web: false,
      peers: []
    });
    graphStore = new GraphStore(gun);
  });

  afterEach(() => {
    graphStore.destroy();
  });

  it("should initialize with empty nodes and links", () => {
    const state = get(graphStore.state);
    assertExists(state);
    assertEquals(Object.keys(state.nodes).length, 0);
    assertEquals(Object.keys(state.links).length, 0);
  });

  it("should add a node", async () => {
    const nodeData = { label: "Test Node", type: "test" };
    const id = await graphStore.addNode(nodeData);
    
    const state = get(graphStore.state);
    assertExists(state);
    assertExists(state.nodes[id]);
    assertEquals(state.nodes[id].label, "Test Node");
    assertEquals(state.nodes[id].type, "test");
  });

  it("should update a node", async () => {
    const nodeData = { label: "Test Node" };
    const id = await graphStore.addNode(nodeData);
    await graphStore.updateNode(id, { label: "Updated Node", type: "updated" });
    
    const state = get(graphStore.state);
    assertExists(state);
    assertEquals(state.nodes[id].label, "Updated Node");
    assertEquals(state.nodes[id].type, "updated");
  });

  it("should add a link between nodes", async () => {
    const node1Data = { label: "Test Node 1" };
    const node2Data = { label: "Test Node 2" };
    
    const id1 = await graphStore.addNode(node1Data);
    const id2 = await graphStore.addNode(node2Data);
    const linkId = await graphStore.addLink({ source: id1, target: id2, label: "connects to" });
    
    const state = get(graphStore.state);
    assertExists(state);
    assertExists(state.links[linkId]);
    assertEquals(state.links[linkId].source, id1);
    assertEquals(state.links[linkId].target, id2);
    assertEquals(state.links[linkId].label, "connects to");
  });

  it("should update a link", async () => {
    const node1Data = { label: "Test Node 1" };
    const node2Data = { label: "Test Node 2" };
    
    const id1 = await graphStore.addNode(node1Data);
    const id2 = await graphStore.addNode(node2Data);
    const linkId = await graphStore.addLink({ source: id1, target: id2, label: "connects to" });
    
    await graphStore.updateLink(linkId, { label: "updated connection", value: 42 });
    
    const state = get(graphStore.state);
    assertExists(state);
    assertEquals(state.links[linkId].label, "updated connection");
    assertEquals(state.links[linkId].value, 42);
  });

  it("should remove a node and its associated links", async () => {
    const node1Data = { label: "Test Node 1" };
    const node2Data = { label: "Test Node 2" };
    
    const id1 = await graphStore.addNode(node1Data);
    const id2 = await graphStore.addNode(node2Data);
    const linkId = await graphStore.addLink({ source: id1, target: id2 });
    
    await graphStore.removeNode(id1);
    
    const state = get(graphStore.state);
    assertExists(state);
    assertEquals(state.nodes[id1], undefined);
    assertEquals(Object.keys(state.links).length, 0);
  });

  it("should remove a link", async () => {
    const node1Data = { label: "Test Node 1" };
    const node2Data = { label: "Test Node 2" };
    
    const id1 = await graphStore.addNode(node1Data);
    const id2 = await graphStore.addNode(node2Data);
    const linkId = await graphStore.addLink({ source: id1, target: id2 });
    
    await graphStore.removeLink(linkId);
    
    const state = get(graphStore.state);
    assertExists(state);
    assertEquals(state.links[linkId], undefined);
    assertEquals(Object.keys(state.links).length, 0);
  });

  it("should handle node selection", () => {
    const nodeId = "test-node";
    graphStore.selectNode(nodeId);
    
    const state = get(graphStore.state);
    assertExists(state);
    assertEquals(state.selectedNode, nodeId);
  });

  it("should handle link selection", () => {
    const linkId = "test-link";
    graphStore.selectLink(linkId);
    
    const state = get(graphStore.state);
    assertExists(state);
    assertEquals(state.selectedLink, linkId);
  });

  it("should handle error states", async () => {
    const state = get(graphStore.state);
    assertExists(state);
    assertEquals(state.error, undefined);

    // Try to update a non-existent node
    try {
      await graphStore.updateNode("non-existent", { label: "Test" });
    } catch (error) {
      const errorState = get(graphStore.state);
      assertExists(errorState);
      assertEquals(errorState.error, "Node non-existent not found");
    }

    graphStore.clearError();
    const clearedState = get(graphStore.state);
    assertExists(clearedState);
    assertEquals(clearedState.error, undefined);
  });

  it("should provide graph data in D3-compatible format", async () => {
    const node1Data = { label: "Node 1", x: 100, y: 100 };
    const node2Data = { label: "Node 2", x: 200, y: 200 };
    
    const id1 = await graphStore.addNode(node1Data);
    const id2 = await graphStore.addNode(node2Data);
    await graphStore.addLink({ source: id1, target: id2, value: 1 });
    
    const graphData = get(graphStore.graphData);
    assertEquals(graphData.nodes.length, 2);
    assertEquals(graphData.links.length, 1);
    
    const node1 = graphData.nodes.find(n => n.id === id1);
    assertExists(node1);
    assertEquals(node1.x, 100);
    assertEquals(node1.y, 100);
    
    const link = graphData.links[0];
    assertEquals(link.source, id1);
    assertEquals(link.target, id2);
    assertEquals(link.value, 1);
  });
}); 