import { writable, get } from 'svelte/store';
import { fetchApi, tick } from '../utils/api.js';

const fetchIssue = async (key) => {
  await tick(100);
  try {
    const data = await fetchApi(`/rest/api/3/issue/${key}`);
    if (data.id) {
      const issue = {
        id: data.id,
        key: data.key,
        summary: data.fields.summary,
        status: data.fields.status.name,
        fetching: false,
        url: data.self.replace(/\/rest\/(.*)/,'') + `/browse/${data.key}`,
        data,
      };
      issuePool.add(issue);
      return Promise.resolve(issue);
    }
    return Promise.reject(`Error while fetching ticket: ${JSON.stringify(data)}`);
  } catch(error) {
    return Promise.reject(`Error while fetching ticket: ${error}`);
  }
};

export const emptyIssue = {
  id: '',
  key: '',
  summary: '',
  status: '',
  fetching: false,
  url: '#',
  data: null,
};

const addToPool = (pool, issue) => {
  const ret = [...pool];
  const foundIndex = ret.findIndex((_issue) => _issue.key === issue.key);
  if (foundIndex > -1) {
    ret[foundIndex] = issue;
  } else {
    ret.push(issue);
  }
  return ret;
}

export const issuePool = (() => {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    addByKey: (key) => update(pool => {
      fetchIssue(key)
        .then(issue => issuePool.add(issue))
        .catch(error => console.log(error));
      return addToPool(pool, {...emptyIssue, key });
    }),
    add: (issue) => update(pool => {
      return addToPool(pool, issue);
    }),
    getByKey: (key) => get(issuePool).find(_issue => _issue.key === key),
  };
})();