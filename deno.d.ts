// Type definitions for Gun
export interface IGunInstance<T = any> {
  server(req: Request): Promise<Response>;
  get(path: string): IGunChain<T>;
  put(data: T): IGunChain<T>;
  set(data: T): IGunChain<T>;
  on(callback: (data: T) => void): IGunChain<T>;
  once(callback: (data: T) => void): IGunChain<T>;
  map(): IGunChain<T>;
}

export interface IGunChain<T = any> {
  get(path: string): IGunChain<T>;
  put(data: T): IGunChain<T>;
  set(data: T): IGunChain<T>;
  on(callback: (data: T) => void): IGunChain<T>;
  once(callback: (data: T) => void): IGunChain<T>;
  map(): IGunChain<T>;
}

declare module "gun" {
  interface GunOptions {
    web?: number;
    file?: string;
    radisk?: boolean;
    multicast?: boolean;
  }

  interface GunConstructor {
    (options?: GunOptions): IGunInstance;
  }

  const Gun: GunConstructor;
  export default Gun;
}

// Type definitions for SEA
declare module "sea" {
  const SEA: any; // TODO: Add proper type definitions
  export default SEA;
}

// Type definitions for lib/index.js
declare module "gun-lib" {
  export * from "./lib/index";
}

// Type definitions for Deno standard library
declare module "$std/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler?: (request: Request) => Response | Promise<Response>;
    onListen?: (params: { port: number; hostname: string }) => void;
  }

  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: ServeInit
  ): Promise<void>;
}

declare module "$std/http/file_server.ts" {
  export interface ServeDirOptions {
    fsRoot?: string;
    urlRoot?: string;
    showIndex?: boolean;
    showDirListing?: boolean;
  }

  export function serveDir(
    req: Request,
    opts?: ServeDirOptions
  ): Promise<Response>;
}

declare module "$std/flags/mod.ts" {
  export interface ParseOptions {
    boolean?: string[] | boolean;
    string?: string[];
    alias?: { [key: string]: string };
    default?: { [key: string]: any };
  }

  export function parse(
    args: string[],
    options?: ParseOptions
  ): { [key: string]: any };
}

declare module "$std/path/mod.ts" {
  export function join(...paths: string[]): string;
}

// Deno API types
declare namespace Deno {
  export const args: string[];
  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };
  export function exit(code?: number): never;
}

declare interface ImportMeta {
  url: string;
  main: boolean;
} 