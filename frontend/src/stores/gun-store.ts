import { writable, derived } from 'svelte/store';

// This script dynamically loads Gun from the current host rather than from a CDN
function loadGun() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/gun.js';
    script.onload = () => {
      // @ts-ignore - Global Gun variable will be available after script loads
      const Gun = window.Gun;
      resolve(Gun);
    };
    script.onerror = (error) => {
      reject(new Error(`Failed to load Gun: ${error}`));
    };
    document.head.appendChild(script);
  });
}

// Create a store for Gun instance
const createGunStore = () => {
  const { subscribe, set, update } = writable({
    gun: null,
    peers: {},
    status: 'disconnected',
    stats: {
      sent: 0,
      received: 0,
      mesg: 0,
      link: 0,
      put: 0,
      get: 0
    },
    error: null
  });

  return {
    subscribe,
    initialize: async () => {
      try {
        // @ts-ignore - Load Gun dynamically
        const Gun = await loadGun();
        
        // Connect to the local Gun server
        // @ts-ignore - Gun is loaded dynamically
        const gun = Gun({ peers: [`${window.location.origin}/gun`] });
        
        // Track peers
        const peers = {};
        gun.on('hi', peer => {
          update(state => {
            state.peers[peer.id] = peer;
            state.status = 'connected';
            return state;
          });
        });
        
        gun.on('bye', peer => {
          update(state => {
            delete state.peers[peer.id];
            return state;
          });
        });
        
        // Update stats
        setInterval(() => {
          if (gun.stats) {
            update(state => ({
              ...state,
              stats: gun.stats()
            }));
          }
        }, 1000);
        
        update(state => ({ ...state, gun, status: 'initialized' }));
      } catch (error) {
        update(state => ({ ...state, error: error.message }));
      }
    },
    put: (path, data) => {
      update(state => {
        if (state.gun) {
          const node = path.split('/').reduce((acc, part) => {
            return part ? acc.get(part) : acc;
          }, state.gun);
          
          node.put(data);
        }
        return state;
      });
    },
    get: (path) => {
      return new Promise((resolve) => {
        update(state => {
          if (state.gun) {
            const node = path.split('/').reduce((acc, part) => {
              return part ? acc.get(part) : acc;
            }, state.gun);
            
            node.once((data) => {
              resolve(data);
            });
          }
          return state;
        });
      });
    }
  };
};

export const gunStore = createGunStore();

// Create derived stores for different aspects of Gun data
export const peersCount = derived(
  gunStore,
  $gunStore => Object.keys($gunStore.peers).length
);

export const connectionStatus = derived(
  gunStore,
  $gunStore => $gunStore.status
);

export const stats = derived(
  gunStore,
  $gunStore => $gunStore.stats
);
