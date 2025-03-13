import type { GunChain } from 'gun-types';
import { writable, type Writable } from 'npm:svelte@5.0.0-next.1/store';

export interface GunStoreOptions<T> {
  initialValue?: T;
}

export class GunStore<T> {
  public readonly store: Writable<T | undefined>;
  private unsubscribe: (() => void) | undefined;

  constructor(private gun: GunChain<T>, options: GunStoreOptions<T> = {}) {
    this.store = writable<T | undefined>(options.initialValue);
    this.setupGunSubscription();
  }

  private setupGunSubscription() {
    this.unsubscribe = this.gun.on((data: T, key: string) => {
      if (data === null) {
        this.store.set(undefined);
      } else {
        this.store.set(data);
      }
    });
  }

  subscribe(run: (value: T | undefined) => void) {
    return this.store.subscribe(run);
  }

  set(value: T) {
    this.gun.put(value);
  }

  update(updater: (value: T) => T) {
    this.store.update((currentValue) => {
      if (currentValue === undefined) {
        throw new Error('Cannot update undefined value');
      }
      const newValue = updater(currentValue);
      this.gun.put(newValue);
      return newValue;
    });
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// Factory function for creating typed Gun stores
export function createGunStore<T>(
  gun: GunChain<T>,
  options: GunStoreOptions<T> = {}
): GunStore<T> {
  return new GunStore<T>(gun, options);
} 