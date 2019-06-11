import { writable, get } from 'svelte/store';
import { fetchApi } from '../utils/api.js';
import { isAuthenticated } from '../auth/store.js';
import { Pool } from '../utils/pool.js';

const fetchIssue = async (key) => {
  try {
    const data = await fetchApi(`/rest/api/3/issue/${key}`);
    if (data.id) {
      const issueData = {
        id: data.id,
        key: data.key,
        summary: data.fields.summary,
        status: data.fields.status.name,
        url: data.self.replace(/\/rest\/(.*)/,'') + `/browse/${data.key}`,
        data,
      };
      return Promise.resolve(issueData);
    }
    return Promise.reject(`Error while fetching ticket ${key}: ${JSON.stringify(data)}`);
  } catch(error) {
    return Promise.reject(`Error while fetching ticket ${key}: ${error}`);
  }
};

export const emptyIssue = {
  id: '',
  key: '',
  summary: '',
  status: '',
  url: '#',
  data: null,
};

export const issuePool = new Pool(emptyIssue, fetchIssue);

isAuthenticated.subscribe(v => {
  if (!v) {
    issuePool.reset();
  } {
    issuePool.refresh();
  }
});