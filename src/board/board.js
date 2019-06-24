import { writable, derived, get } from 'svelte/store';
import { fetchAllPages, fetchApi } from '../utils/api.js';
import { createDataFormatter } from '../utils/store.js';
import { authUser } from '../auth/authUser.js';

const _d = createDataFormatter({
  boards: {},
}, true);

const _dItem = createDataFormatter({
  id: '',
  name: '',
  type: '',
  projectKey: null,
}, false);

const boardPool = {};
export const getBoardsForProject = (projectKey) => {
  if (boardPool[projectKey] !== undefined) {
    return boardPool[projectKey];
  }

  const data = writable(_d.data());
  const boardStores = {};

  const setData = _data => data.set(_d.data(_data));
  const setSuccess = (_data, _result) => data.set(_d.success(_data));
  const setError = (_errorResult) => data.update(_data => _d.error(_data));
  const clear = () => data.set(_d.data());

  const getPool = () => data;
  const getPoolData = () => get(data) || {};
  const getBoardArray = () => Object.values(getPoolData().boards);

  const getItem = (id) => {
    if (boardStores[id] === undefined) {
      boardStores[id] = derived(data, _data => _data.boards[id] || null, null);
    }
    return boardStores[id];
  }

  const getItemData = (id) => get(getItem(id));

  const hasItem = (id) => {
    return getItem(id) !== undefined;
  }

  const getConfig = getConfigForBoard;

  const fetching =
    derived(data, _data => _data.isFetching, null);
  const loaded =
    derived(data, _data => _data.ok !== null, null);
  const ok =
    derived(data, _data => _data.ok, null);

  const fetchAll = async () => {
    try {
      setData({ isFetching: true });
      const pages = await fetchAllPages(`/rest/agile/1.0/board?projectKeyOrId=${projectKey}&startAt=%start%&maxResults=%max%`, 50);
      const boards = {};
      const results = {};
      pages
        .reduce((acc, page) => [...acc, ...page.values], [])
        .map(_board => {
          const { id, name, type } = _board;
          results[id] = _board;
          boards[id] = _dItem.data({ id, name, type, projectKey, config: null });
        });
      setSuccess({ boards }, results);
    } catch(error) {
      setError({ boards: {}}, error);
      console.warn(`Error while fetching boards:`, error);
    }
  };

  fetchAll();

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
    getBoardArray,
    getConfig,
  }
};

const _dConf = createDataFormatter({
  id: '',
  name: '',
  columnConfig: { columns: []},
  location: null,
}, true);

const configPool = {};
export const getConfigForBoard = (id) => {
  if (configPool[id] !== undefined) {
    return boardPool[id];
  }

  const data = writable(_dConf.data());

  const setData = _data => data.set(_dConf.data(_data));
  const setSuccess = (_data, _result) => data.set(_dConf.success(_data, _result));
  const setError = (_errorResult) => data.set(_dConf.error(_errorResult));
  const clear = () => data.set(_dConf.data());

  const getData = () => get(data);

  const fetching =
    derived(data, _data => _data.isFetching, null);
  const loaded =
    derived(data, _data => _data.ok !== null, null);
  const ok =
    derived(data, _data => _data.ok, null);

  const fetchData = async () => {
    try {
      setData({ isFetching: true });
      const result = await fetchApi(`/rest/agile/1.0/board/${id}/configuration`);
      const { name, columnConfig, location } = result;
      setSuccess({ id, name, columnConfig, location }, result);
    } catch(error) {
      setError(error);
      console.warn(`Error while fetching board configuration ${id}:`, error);
    }
  };

  fetchData();

  authUser.onLogout(() => {
    clear();
  });

  return {
    data,
    fetching,
    loaded,
    ok,
    fetchData,
    getData
  }
};