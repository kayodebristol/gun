import { wrap } from 'svelte-spa-router/wrap';

export default {
  '/': wrap({
    component: () => import('./routes/Home.svelte'),
  }),
  '/graph': wrap({
    component: () => import('./routes/GraphView.svelte'),
  }),
  '/data': wrap({
    component: () => import('./routes/DataExplorer.svelte'),
  }),
  '/settings': wrap({
    component: () => import('./routes/Settings.svelte'),
  }),
  '*': wrap({
    component: () => import('./routes/NotFound.svelte'),
  }),
}; 