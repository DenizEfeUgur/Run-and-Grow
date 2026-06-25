import { Injectable } from '@angular/core';

/**
 * Thin, defensive wrapper around `localStorage`.
 *
 * All reads/writes are JSON encoded and guarded against environments where
 * storage is unavailable (e.g. private mode) so the app never crashes.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly available = this.checkAvailability();

  get<T>(key: string, fallback: T): T {
    if (!this.available) {
      return fallback;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.available) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota / serialization errors */
    }
  }

  remove(key: string): void {
    if (!this.available) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  private checkAvailability(): boolean {
    try {
      const testKey = '__run_and_grow_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
