// Type definitions for Gun library
import type { IGunInstance, IGunChain } from "../deno";

// Export core types
export { IGunInstance, IGunChain };

// Additional utility types
export interface IGunOptions {
  peers?: string[];
  web?: number;
  file?: string;
  s3?: {
    key: string;
    secret: string;
    bucket: string;
  };
  radisk?: boolean;
  localStorage?: boolean;
  multicast?: boolean;
}

export interface IGunUser {
  create: (username: string, password: string, callback?: (ack: any) => void) => Promise<any>;
  auth: (username: string, password: string, callback?: (ack: any) => void) => Promise<any>;
  leave: () => void;
  delete: (username: string, password: string) => Promise<any>;
  recall: (options?: { sessionStorage?: boolean }) => Promise<any>;
  trust: (user: any) => any;
}

export interface IGunSEA {
  pair: () => Promise<{
    pub: string;
    priv: string;
    epub: string;
    epriv: string;
  }>;
  sign: (data: any, pair: any) => Promise<string>;
  verify: (data: any, pub: string, sig: string) => Promise<any>;
  encrypt: (data: any, pair: any) => Promise<string>;
  decrypt: (data: string, pair: any) => Promise<any>;
  work: (data: any, pair: any, callback?: Function) => Promise<string>;
}

// Export utility functions
export function generateId(): string;
export function isValidPath(path: string): boolean;
export function parseGunPath(path: string): string[];

// Export server-related types
export interface IGunServer {
  start: (options: IGunOptions) => Promise<void>;
  stop: () => Promise<void>;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
} 