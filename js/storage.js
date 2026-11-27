// Replace this adapter with IndexedDB in V1.1. Errors deliberately propagate.
import { STORAGE_KEY, SCHEMA_VERSION } from './config.js?v=1.1.8';
export function createStorage(backend = globalThis.localStorage) {
  return {
    async read() {
      const raw = backend.getItem(STORAGE_KEY);
      if(raw === null) return {schemaVersion:SCHEMA_VERSION, records:[]};
      const data = JSON.parse(raw);
      if(data.schemaVersion !== SCHEMA_VERSION || !Array.isArray(data.records)) throw new Error('Unsupported or damaged local data');
      return data;
    },
    async write(data) { backend.setItem(STORAGE_KEY, JSON.stringify(data)); }
  };
}
