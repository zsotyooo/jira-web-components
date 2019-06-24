import { writable, derived, get } from 'svelte/store';
import { fetchApi } from '../utils/api.js';
import { createDataFormatter } from '../utils/store.js';
import { authUser } from '../auth/authUser.js';


const _d = createDataFormatter({
  id: '',
  key: '',
  summary: '',
  status: '',
  url: '#',
}, true);

export const issues = (() => {
  const pool = {};

  const getPool = () => {
    return pool;
  }

  const getItem = (key) => {
    return getPool()[key];
  }

  const getItemData = (key) => {
    return get(getItem(key).data);
  }

  const hasItem = (key) => {
    return getItem(key) !== undefined;
  }

  const fetchItem = async (key) => {
    try {
      setItem(key, { isFetching: true });
      const result = await fetchApi(`/rest/api/3/issue/${key}`);
      const {id, fields, self} = result;
      setItem(
        key,
        _d.success({
          id,
          key,
          summary: fields.summary,
          status: fields.status.name,
          url: self.replace(/\/rest\/(.*)/,'') + `/browse/${key}`,
        }, result)
      );
    } catch(error) {
      setItem(
        key,
        _d.error({ key }, error)
      );
      console.warn(`Error while fetching ticket ${key}:`, error);
    }
  }

  const resetItem = (key) => {
    if (hasItem(key)) {
      pool[key].data.set(_d.data({ key }));
    }
  }
  
  const setItem = (key, initData) => {
    if (!hasItem(key)) {
      const data = writable(_d.data({ key }, initData || {}));
      const fetching = derived(data, _data => _data.isFetching, null);
      const loaded = derived(data, _data => _data.ok !== null, null);
      const ok = derived(data, _data => _data.ok, null);

      pool[key] = {
        data,
        fetching,
        loaded,
        ok
      }

      authUser.onLogout(() => {
        resetItem(key);
      });

      authUser.onLogin(() => {
        fetchItem(key);
      });

    } else {
      getItem(key).data.update(currentData => _d.data(currentData, initData || {}))
    }
    return getItem(key);
  }
  
  return {
    hasItem,
    getItem,
    getItemData,
    setItem,
  }
})();