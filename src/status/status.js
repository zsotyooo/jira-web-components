import { writable, derived, get } from 'svelte/store';
import { fetchApi } from '../utils/api.js';
import { createDataFormatter } from '../utils/store.js';
import { authUser } from '../auth/authUser.js';


const _d = createDataFormatter({
  description: '',
  iconUrl: '',
  name: '',
  id: '',
}, true);

export const statuses = (() => {
  const pool = {};

  const getPool = () => {
    return pool;
  }

  const getItem = (id) => {
    return getPool()[id];
  }

  const getItemData = (id) => {
    return get(getItem(id).data);
  }

  const hasItem = (id) => {
    return getItem(id) !== undefined;
  }

  const fetchItem = async (id) => {
    try {
      setItem(id, { isFetching: true });
      const result = await fetchApi(`/rest/api/3/status/${id}`);
      const {description, iconUrl, name} = result;
      setItem(
        id,
        _d.success({
          id, description, iconUrl, name,
        }, result)
      );
    } catch(error) {
      setItem(
        id,
        _d.error({ id }, error)
      );
      console.warn(`Error while fetching status ${id}:`, error);
    }
  }

  const resetItem = (id) => {
    if (hasItem(id)) {
      pool[id].data.set(_d.data({ id }));
    }
  }
  
  const setItem = (id, initData) => {
    if (!hasItem(id)) {
      const data = writable(_d.data({ id }, initData || {}));
      const fetching = derived(data, _data => _data.isFetching, null);
      const loaded = derived(data, _data => _data.ok !== null, null);
      const ok = derived(data, _data => _data.ok, null);

      pool[id] = {
        data,
        fetching,
        loaded,
        ok
      }

      authUser.onLogout(() => {
        resetItem(id);
      });

      authUser.onLogin(() => {
        fetchItem(id);
      });

    } else {
      getItem(id).data.update(currentData => _d.data(currentData, initData || {}))
    }
    return getItem(id);
  }
  
  return {
    hasItem,
    getItem,
    getItemData,
    setItem,
  }
})();