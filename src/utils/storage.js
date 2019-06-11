import { writable, get } from 'svelte/store';
import { isSafe } from '../global/store.js';

const storageKey = (key) => `__jira-${key}`;

export const readData = (key) => localStorage.getItem(storageKey(key));
export const hydrateData = (key, value) => localStorage.setItem(storageKey(key), value || '');
export const deleteData = (key) => localStorage.removeItem(storageKey(key));

export const createSavedStoreFor = (key) => {
  const _isSafe = get(isSafe);
  const store = writable(_isSafe ? (readData(key) || '') : '');

  if (_isSafe) {
    store.subscribe(v => {
      hydrateData(key, v)
    });
  }

  return store;
}