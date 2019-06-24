import { writable, derived, get } from 'svelte/store';
import { fetchAllPages } from '../utils/api.js';
import { createDataFormatter } from '../utils/store.js';
import { authUser } from '../auth/authUser.js';


const _d = createDataFormatter({
  projects: {},
}, true);

const _dItem = createDataFormatter({
  id: '',
  key: '',
  name: '',
  isPrivate: false,
  avatarUrls: {
    '16x16': null,
    '24x24': null,
    '32x32': null,
    '48x48': null,
  },
  url: '#',
}, false);

export const projects = (() => {
  const data = writable(_d.data());
  const projectStores = {};

  const setData = _data => data.set(_d.data(_data));
  const setSuccess = (_data, _result) => data.set(_d.success(_data));
  const setError = (_data, _errorResult) => data.set(_d.error(_data));
  const clear = () => data.set(_d.data());

  const getPool = () => data;
  const getPoolData = () => get(data) || {};
  const getProjectArray = () => Object.values(getPoolData().projects);

  const getItem = (key) => {
    if (projectStores[key] === undefined) {
      projectStores[key] = derived(data, _data => _data.projects[key] || null, null);
    }
    return projectStores[key];
  }

  const getItemData = (key) => get(getItem(key));

  const hasItem = (key) => {
    return getItem(key) !== undefined;
  }

  const fetching =
    derived(data, _data => _data.isFetching, null);
  const loaded =
    derived(data, _data => _data.ok !== null, null);
  const ok =
    derived(data, _data => _data.ok, null);

  const fetchAll = async () => {
    try {
      setData({ isFetching: true });
      const pages = await fetchAllPages(`/rest/api/3/project/search?orderBy=+key&startAt=%start%&maxResults=%max%`, 50);
      const projects = {};
      const results = {};
      pages
        .reduce((acc, page) => [...acc, ...page.values], [])
        .map(_project => {
          const { id, key, name, isPrivate, avatarUrls, self } = _project;
          results[key] = _project;
          projects[key] = _dItem.data({
            id, key, name, isPrivate, avatarUrls,
            url: self.replace(/\/rest\/(.*)/,'') + `/browse/${key}`,
          });
        });
      setSuccess({ projects }, results);
    } catch(error) {
      setError({ projects: {}}, error);
      console.warn(`Error while fetching projects:`, error);
    }
  };

  authUser.onLogin(() => {
    fetchAll();
  });
  authUser.onLogout(() => {
    clear();
  });

  return {
    data,
    fetching,
    loaded,
    ok,
    fetchAll,
    getItem,
    getItemData,
    getPool,
    getPoolData,
    getProjectArray,
  }
})();