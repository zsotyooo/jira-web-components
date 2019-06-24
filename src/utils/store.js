import { writable, derived, get } from 'svelte/store';

export const now = () => ((new Date()).getTime());

const initialFetchingData = {
  isFetching: null,
  lastFetchTime: null,
  ok: null,
  error: null,
  result: null,
  errorResult: null,
};

export const createDataFormatter = (temp, fetchAble) => {
  const _d = (...data) => [temp, fetchAble ? initialFetchingData : {}, ...data].reduce((a, c) => ({...a, ...c}), {});
  return {
    data: _d,
    success: (data, result) => _d(data, { isFetching: false, ok: true, lastFetchTime: now(), result, errorResult: null }),
    error: (data, errorResult) => _d(data, { isFetching: false, ok: false, lastFetchTime: now(), result: null, errorResult }),
  }
}

export const getSuccessData = (data, result, _d) =>
  _d(data, { isFetching: false, ok: true, lastFetchTime: now(), result, errorResult: null });

export const getErrorData = (errorResult, _d, _id) =>
  _d({ [_id]: key, isFetching: false, ok: false, lastFetchTime: now(), result: null, errorResult });

export const createKeyedStore = (key, _d, initData, _id) => {
  if (!_id) {
    _id = 'key';
  }
  const store = writable(_d(initData || {}, { [_id]: key }));

  const { subscribe, update, set } = store;
  const setIsFetching = (isFetching) =>
    update(currentData => _d(currentData, { isFetching }));
  const setData = (data) =>
    update(currentData => _d(currentData, data));
  const setSuccess = (data, result) =>
    update(currentData => _d(currentData, data, { isFetching: false, ok: true, lastFetchTime: now(), result, errorResult: null }));
  const setError = (errorResult) =>
    update(currentData => _d({ [_id]: key, isFetching: false, ok: false, lastFetchTime: now(), result: null, errorResult }));
  const fetching =
    derived(store, data => data.isFetching, null);
  const loaded =
    derived(store, data => data.ok !== null, null);
  const ok =
    derived(store, data => data.ok, null);
  const isFetching = () => get(fetching);
  const isLoaded = () => get(loaded) !== null;
  const isOk = () => get(ok);
  const getData = () => get(store);
  const getKey = () => getData()[_id];
  const reset = () => set(_d({ [_id]: key }));

  return {
    store,
    subscribe,
    
    reset,

    setIsFetching,
    setData,
    setSuccess,
    setError,

    getData,
    getKey,
    
    fetching,
    loaded,
    ok,
    
    isFetching,
    isLoaded,
    isOk,
  }
};

export const createKeyedStorePool = (createItemFn, _id) => {
  if (!_id) {
    _id = 'key';
  }
  const store = writable([]);
  const { subscribe, update, set } = store;

  const setPool = pool => set(pool);
  const addItem = (key, data) => {
    if (!hasItem(key)) {
      update(pool => pool.push(createItemFn(key, data || {})) && pool);
    }
    return getItem(key);
  };
  const removeItem = key => {
    if (!hasItem(key)) {
      update(pool => pool.splice(getItemIndex(key), 1) && pool);
    }
  };
  const resetItem = key => {
    if (!hasItem(key)) {
      getItem(key).reset();
    }
  };
  const clear = () => set([]);
  const each = fn => getPool().map(_item => fn(_item));
  const resetAll = () => each(_item => _item.reset());

  const hasItem = key => !!getItem(key);

  const getPool = () => get(store);
  const getItem = key => getPool().find(_item => _item.getKey() === key);
  const getItemIndex = key => getPool().findIndex(_item => _item.getKey() === key);

  return {
    store,
    subscribe,

    setPool,
    addItem,
    removeItem,
    resetItem,
    clear,
    each,
    resetAll,

    hasItem,

    getPool,
    getItem,
    getItemIndex,
  }
};