// Type definitions for SEA ESM wrapper

export interface KeyPair {
  pub: string;
  priv: string;
  epub?: string;
  epriv?: string;
}

export interface SEA {
  pair(): Promise<KeyPair>;
  sign(data: any, pair: KeyPair): Promise<string>;
  verify(data: any, pub: string, sig?: string): Promise<any>;
  encrypt(data: any, pair: KeyPair | string): Promise<string>;
  decrypt(data: string, pair: KeyPair | string): Promise<any>;
  work(data: string, salt?: string, opt?: { name?: string; encode?: string }): Promise<string>;
  random(bytes?: number): string;
  hash(data: any, opt?: { name?: string; encode?: string }): Promise<string>;
  certify(cert: any, pub: string, priv: string): Promise<string>;
  proof(proof: any, pub: string, priv: string): Promise<string>;
  [key: string]: any;
}

declare const SEA: SEA;
export default SEA;

export const pair: SEA['pair'];
export const sign: SEA['sign'];
export const verify: SEA['verify'];
export const encrypt: SEA['encrypt'];
export const decrypt: SEA['decrypt'];
export const work: SEA['work'];
export const random: SEA['random'];
export const hash: SEA['hash'];
export const certify: SEA['certify'];
export const proof: SEA['proof']; 