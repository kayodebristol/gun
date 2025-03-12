// Type definitions for Gun ESM wrapper

export interface GunOptions {
  file?: boolean | string;
  localStorage?: boolean;
  radisk?: boolean;
  memory?: boolean;
  web?: number | boolean;
  multicast?: boolean;
  [key: string]: any;
}

export interface GunChain<T = any> {
  put(data: Partial<T>): GunChain<T>;
  get(path: string): GunChain<T>;
  set(data: Partial<T>): GunChain<T>;
  map(): GunChain<T>;
  on(callback: (data: T, key: string, _: any, ev: any) => void): GunChain<T>;
  once(callback: (data: T, key: string) => void): GunChain<T>;
  path(path: string | string[]): GunChain<T>;
  back(): GunChain<T>;
  not(callback: (key: string) => void): GunChain<T>;
  val(callback: (data: T) => void): void;
  [key: string]: any;
}

export interface GunEvents {
  on(event: 'hi' | 'bye', callback: (peer: string) => void): void;
  off(event: 'hi' | 'bye', callback: (peer: string) => void): void;
  [key: string]: any;
}

export interface GunConstructor {
  new (options?: GunOptions): GunChain & GunEvents;
  (options?: GunOptions): GunChain & GunEvents;
  chain: GunChain;
  node: GunChain;
  back: GunChain;
  val: GunChain;
  text: GunChain;
  json: GunChain;
  on: GunChain;
  map: GunChain;
  set: GunChain;
  path: GunChain;
  not: GunChain;
  lex: GunChain;
  server(req: Request): Promise<Response>;
  [key: string]: any;
}

declare const Gun: GunConstructor;
export default Gun;

export const node: GunChain;
export const chain: GunChain;
export const back: GunChain;
export const val: GunChain;
export const text: GunChain;
export const json: GunChain;
export const on: GunChain;
export const map: GunChain;
export const set: GunChain;
export const path: GunChain;
export const not: GunChain;
export const lex: GunChain; 