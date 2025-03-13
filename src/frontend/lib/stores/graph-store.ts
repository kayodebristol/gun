import type { GunChain } from 'gun-types';
import { derived, writable, type Updater, type Writable } from 'npm:svelte@5.0.0-next.1/store';
import { GunStore } from './gun-store.ts';

export interface Node {
  id: string;
  label: string;
  type?: string;
  data?: any;
  x?: number;
  y?: number;
  _?: {
    '#': string;
    '>': Record<string, any>;
  };
}

export interface Link {
  source: string;
  target: string;
  label?: string;
  type?: string;
  value?: number;
  data?: any;
  _?: {
    '#': string;
    '>': Record<string, any>;
  };
}

export interface LinkInput {
  source: string | { id: string };
  target: string | { id: string };
  label?: string;
  type?: string;
  value?: number;
  data?: any;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
  selectedNode?: string;
  selectedLink?: string;
  loading: boolean;
  error?: string;
}

export interface StoreState {
  nodes: Record<string, Node>;
  links: Record<string, Link>;
  selectedNode?: string;
  selectedLink?: string;
  loading: boolean;
  error?: string;
}

export class GraphStore {
  private readonly nodesStore: GunStore<Record<string, Node>>;
  private readonly linksStore: GunStore<Record<string, Link>>;
  private readonly selectedNodeStore = writable<string | undefined>(undefined);
  private readonly selectedLinkStore = writable<string | undefined>(undefined);
  private readonly loadingStore = writable<boolean>(false);
  private readonly errorStore = writable<string | undefined>(undefined);

  constructor(gun: GunChain<any>) {
    this.nodesStore = new GunStore<Record<string, Node>>(gun.get('nodes'), { initialValue: {} });
    this.linksStore = new GunStore<Record<string, Link>>(gun.get('links'), { initialValue: {} });
  }

  readonly state = derived<
    [
      Writable<Record<string, Node> | undefined>,
      Writable<Record<string, Link> | undefined>,
      Writable<string | undefined>,
      Writable<string | undefined>,
      Writable<boolean>,
      Writable<string | undefined>
    ],
    StoreState
  >(
    [
      this.nodesStore.store,
      this.linksStore.store,
      this.selectedNodeStore,
      this.selectedLinkStore,
      this.loadingStore,
      this.errorStore
    ],
    ([nodes, links, selectedNode, selectedLink, loading, error]: [
      Record<string, Node> | undefined,
      Record<string, Link> | undefined,
      string | undefined,
      string | undefined,
      boolean,
      string | undefined
    ]) => ({
      nodes: nodes ?? {},
      links: links ?? {},
      selectedNode,
      selectedLink,
      loading,
      error
    })
  );

  readonly graphData = derived<
    [
      Writable<Record<string, Node> | undefined>,
      Writable<Record<string, Link> | undefined>
    ],
    GraphData
  >(
    [this.nodesStore.store, this.linksStore.store],
    ([nodes, links]: [Record<string, Node> | undefined, Record<string, Link> | undefined]) => ({
      nodes: Object.values(nodes ?? {}).map((node: Node) => ({
        id: node.id,
        label: node.label,
        type: node.type,
        data: node.data,
        x: node.x,
        y: node.y
      })),
      links: Object.values(links ?? {}).map((link: Link) => ({
        source: link.source,
        target: link.target,
        label: link.label,
        type: link.type,
        value: link.value,
        data: link.data
      }))
    })
  );

  // Node operations
  async addNode(node: Omit<Node, 'id' | '_'>) {
    try {
      this.loadingStore.set(true);
      const id = crypto.randomUUID();
      const newNode: Node = {
        id,
        ...node,
        _: { '#': id, '>': {} }
      };

      this.nodesStore.update((nodes) => ({
        ...nodes,
        [id]: newNode
      }));

      this.loadingStore.set(false);
      return id;
    } catch (error) {
      this.errorStore.set(error instanceof Error ? error.message : String(error));
      this.loadingStore.set(false);
      throw error;
    }
  }

  async updateNode(id: string, updates: Partial<Omit<Node, 'id'>>) {
    try {
      this.loadingStore.set(true);
      this.nodesStore.update((nodes) => {
        const node = nodes[id];
        if (!node) throw new Error(`Node ${id} not found`);
        return {
          ...nodes,
          [id]: { ...node, ...updates }
        };
      });

      this.loadingStore.set(false);
    } catch (error) {
      this.errorStore.set(error instanceof Error ? error.message : String(error));
      this.loadingStore.set(false);
      throw error;
    }
  }

  async removeNode(id: string) {
    try {
      this.loadingStore.set(true);
      this.nodesStore.update((nodes) => {
        const { [id]: removed, ...rest } = nodes;
        return rest;
      });

      // Remove associated links
      this.linksStore.update((links) => {
        return Object.entries(links).reduce<Record<string, Link>>((acc, [linkId, link]) => {
          if (link.source === id || link.target === id) {
            return acc;
          }
          return { ...acc, [linkId]: link };
        }, {});
      });

      this.loadingStore.set(false);
    } catch (error) {
      this.errorStore.set(error instanceof Error ? error.message : String(error));
      this.loadingStore.set(false);
      throw error;
    }
  }

  // Link operations
  async addLink(link: LinkInput) {
    try {
      this.loadingStore.set(true);
      const id = crypto.randomUUID();
      const newLink: Link = {
        source: typeof link.source === 'string' ? link.source : link.source.id,
        target: typeof link.target === 'string' ? link.target : link.target.id,
        label: link.label,
        type: link.type,
        value: link.value,
        data: link.data,
        _: { '#': id, '>': {} }
      };

      this.linksStore.update((links) => ({
        ...links,
        [id]: newLink
      }));

      this.loadingStore.set(false);
      return id;
    } catch (error) {
      this.errorStore.set(error instanceof Error ? error.message : String(error));
      this.loadingStore.set(false);
      throw error;
    }
  }

  async updateLink(id: string, updates: Partial<Omit<Link, 'id'>>) {
    try {
      this.loadingStore.set(true);
      this.linksStore.update((links) => {
        const link = links[id];
        if (!link) throw new Error(`Link ${id} not found`);
        return {
          ...links,
          [id]: { ...link, ...updates }
        };
      });

      this.loadingStore.set(false);
    } catch (error) {
      this.errorStore.set(error instanceof Error ? error.message : String(error));
      this.loadingStore.set(false);
      throw error;
    }
  }

  async removeLink(id: string) {
    try {
      this.loadingStore.set(true);
      this.linksStore.update((links) => {
        const { [id]: removed, ...rest } = links;
        return rest;
      });

      this.loadingStore.set(false);
    } catch (error) {
      this.errorStore.set(error instanceof Error ? error.message : String(error));
      this.loadingStore.set(false);
      throw error;
    }
  }

  // Selection operations
  selectNode(id: string | undefined) {
    this.selectedNodeStore.set(id);
  }

  selectLink(id: string | undefined) {
    this.selectedLinkStore.set(id);
  }

  // Error handling
  clearError() {
    this.errorStore.set(undefined);
  }

  destroy() {
    this.nodesStore.destroy();
    this.linksStore.destroy();
  }
}

// Factory function for creating graph stores
export function createGraphStore(gun: GunChain<any>): GraphStore {
  return new GraphStore(gun);
} 