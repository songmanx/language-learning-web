import "@testing-library/jest-dom";

import.meta.env.VITE_GAS_BASE_URL = "";
import.meta.env.VITE_GAS_USE_MOCK = "true";

type StorageValueMap = Map<string, string>;

function createMemoryStorage() {
  let store: StorageValueMap = new Map();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  } satisfies Storage;
}

Object.defineProperty(window, "localStorage", {
  value: createMemoryStorage(),
  writable: true,
  configurable: true,
});
