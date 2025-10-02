// Lightweight IndexedDB wrapper tailored for gym management domain.
// Avoids external deps. Provides basic CRUD utilities + versioned upgrade path.

export interface GymDBConfig {
  name?: string;
  version?: number;
}

const DEFAULT_DB_NAME = "trickipedia_gym";
const DEFAULT_VERSION = 1;

// Store names
export const STORE = {
  members: "members",
  classes: "classes",
  equipment: "equipment",
  incidents: "incidents",
  waivers: "waivers",
  staff: "staff",
  payments: "payments",
  meta: "meta", // for flags like demoMode
} as const;

export type StoreName = (typeof STORE)[keyof typeof STORE];

let dbPromise: Promise<IDBDatabase> | null = null;

export function initGymDB(config: GymDBConfig = {}): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  const { name = DEFAULT_DB_NAME, version = DEFAULT_VERSION } = config;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      // Create object stores if they don't exist
      Object.values(STORE).forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      });
      // meta store uses keyPath id, but we will have a single record with id 'settings'
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => T | Promise<T>
): Promise<T> {
  const db = await initGymDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    Promise.resolve(fn(store))
      .then((result) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
      })
      .catch(reject);
  });
}

export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  return withStore(storeName, "readonly", (store) => {
    return new Promise<T[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getById<T>(
  storeName: StoreName,
  id: string
): Promise<T | undefined> {
  return withStore(storeName, "readonly", (store) => {
    return new Promise<T | undefined>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function putItem<T extends { id: string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  return withStore(storeName, "readwrite", (store) => {
    return new Promise<T>((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function deleteItem(
  storeName: StoreName,
  id: string
): Promise<void> {
  return withStore(storeName, "readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export async function bulkPut<T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<void> {
  return withStore(storeName, "readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      items.forEach((item) => store.put(item));
      // completion depends on transaction
      store.transaction.oncomplete = () => resolve();
      store.transaction.onerror = () => reject(store.transaction.error);
    });
  });
}

export async function clearStore(storeName: StoreName): Promise<void> {
  return withStore(storeName, "readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    clearStore(STORE.members),
    clearStore(STORE.classes),
    clearStore(STORE.equipment),
    clearStore(STORE.incidents),
    clearStore(STORE.waivers),
    clearStore(STORE.staff),
    clearStore(STORE.payments),
  ]);
}

// Meta helpers
export interface MetaSettings {
  id: string; // always 'settings'
  demoMode: boolean;
  allowOverEnrollment: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getOrInitMeta(): Promise<MetaSettings> {
  const existing = await getById<MetaSettings>(STORE.meta, "settings");
  if (existing) {
    // Migrate old settings without allowOverEnrollment
    if (existing.allowOverEnrollment === undefined) {
      existing.allowOverEnrollment = false;
      await putItem(STORE.meta, existing);
    }
    return existing;
  }
  const now = new Date().toISOString();
  const defaults: MetaSettings = {
    id: "settings",
    demoMode: true,
    allowOverEnrollment: false,
    createdAt: now,
    updatedAt: now,
  };
  await putItem(STORE.meta, defaults);
  return defaults;
}

export async function updateMeta(
  partial: Partial<Omit<MetaSettings, "id" | "createdAt">>
): Promise<MetaSettings> {
  const current = await getOrInitMeta();
  const updated: MetaSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  await putItem(STORE.meta, updated);
  return updated;
}
