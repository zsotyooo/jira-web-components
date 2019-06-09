import { writable, get } from 'svelte/store';

const storageKey = (key) => `__jira-${key}`;

export const readData = (key) => localStorage.getItem(storageKey(key));
export const hydrateData = (key, value) => localStorage.setItem(storageKey(key), value || '');
export const deleteData = (key) => localStorage.removeItem(storageKey(key));

export const createSavedStoreFor = (key) => {
  const store = writable(readData(key));

  store.subscribe(v => {
    hydrateData(key, v)
  });

  return store;
}