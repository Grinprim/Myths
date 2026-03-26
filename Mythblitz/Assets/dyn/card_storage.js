(function () {
  const STORAGE_KEY = 'mythblitz.cards.v1';
  const DB_NAME = 'mythblitz_cards_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'cards';
  const LEGACY_MIGRATION_KEY = 'mythblitz.cards.migrated.v1';

  let dbPromise = null;

  function hasIndexedDb() {
    return typeof window !== 'undefined' && !!window.indexedDB;
  }

  function openDb() {
    if (!hasIndexedDb()) {
      return Promise.reject(new Error('IndexedDB is not available.'));
    }
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };

      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
    });

    return dbPromise;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'));
    });
  }

  async function withStore(mode, run) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);

      let runResult;
      try {
        runResult = run(store);
      } catch (err) {
        reject(err);
        return;
      }

      tx.oncomplete = async () => {
        try {
          const resolved = runResult && typeof runResult.then === 'function'
            ? await runResult
            : runResult;
          resolve(resolved);
        } catch (err) {
          reject(err);
        }
      };
      tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed.'));
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted.'));
    });
  }

  async function migrateLegacyLocalStorageOnce() {
    if (!hasIndexedDb()) return;
    if (localStorage.getItem(LEGACY_MIGRATION_KEY) === '1') return;

    const legacyCards = safeParse(localStorage.getItem(STORAGE_KEY));
    if (!legacyCards.length) {
      localStorage.setItem(LEGACY_MIGRATION_KEY, '1');
      return;
    }

    await withStore('readwrite', (store) => {
      legacyCards.forEach((card) => {
        store.put(card);
      });
      return null;
    });

    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(LEGACY_MIGRATION_KEY, '1');
  }

  function safeParse(raw) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  async function getAllCards() {
    if (!hasIndexedDb()) return safeParse(localStorage.getItem(STORAGE_KEY));
    try {
      await migrateLegacyLocalStorageOnce();
      const rows = await withStore('readonly', (store) => requestToPromise(store.getAll()));
      return Array.isArray(rows) ? rows : [];
    } catch (_err) {
      return safeParse(localStorage.getItem(STORAGE_KEY));
    }
  }

  async function setAllCards(cards) {
    if (!hasIndexedDb()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      return cards;
    }
    try {
      await migrateLegacyLocalStorageOnce();
      await withStore('readwrite', async (store) => {
        await requestToPromise(store.clear());
        cards.forEach((card) => store.put(card));
        return null;
      });
    } catch (_err) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
    return cards;
  }

  function generateId() {
    return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  async function getCardById(id) {
    if (!id) return null;
    if (!hasIndexedDb()) {
      return safeParse(localStorage.getItem(STORAGE_KEY)).find((card) => card.id === id) || null;
    }
    try {
      await migrateLegacyLocalStorageOnce();
      const row = await withStore('readonly', (store) => requestToPromise(store.get(id)));
      return row || null;
    } catch (_err) {
      return safeParse(localStorage.getItem(STORAGE_KEY)).find((card) => card.id === id) || null;
    }
  }

  async function upsertCard(nextCard) {
    if (!hasIndexedDb()) {
      const cards = safeParse(localStorage.getItem(STORAGE_KEY));
      const idx = cards.findIndex((card) => card.id === nextCard.id);
      if (idx >= 0) cards[idx] = nextCard;
      else cards.push(nextCard);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      return nextCard;
    }

    try {
      await migrateLegacyLocalStorageOnce();
      await withStore('readwrite', (store) => requestToPromise(store.put(nextCard)));
    } catch (_err) {
      const cards = safeParse(localStorage.getItem(STORAGE_KEY));
      const idx = cards.findIndex((card) => card.id === nextCard.id);
      if (idx >= 0) cards[idx] = nextCard;
      else cards.push(nextCard);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
    return nextCard;
  }

  async function deleteCardById(id) {
    if (!hasIndexedDb()) {
      const cards = safeParse(localStorage.getItem(STORAGE_KEY)).filter((card) => card.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      return cards;
    }

    try {
      await migrateLegacyLocalStorageOnce();
      await withStore('readwrite', (store) => requestToPromise(store.delete(id)));
      return getAllCards();
    } catch (_err) {
      const cards = safeParse(localStorage.getItem(STORAGE_KEY)).filter((card) => card.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      return cards;
    }
  }

  async function duplicateCard(id) {
    const source = await getCardById(id);
    if (!source) return null;

    const copy = {
      ...source,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: `${source.name || 'Card'} Copy`
    };

    await upsertCard(copy);
    return copy;
  }

  window.MythblitzCardStorage = {
    STORAGE_KEY,
    getAllCards,
    setAllCards,
    generateId,
    getCardById,
    upsertCard,
    deleteCardById,
    duplicateCard
  };
})();
