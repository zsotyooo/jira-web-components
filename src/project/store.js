import { writable, get } from 'svelte/store';
import { fetchAllPages } from '../utils/api.js';
import { isAuthenticated } from '../auth/store.js';
import { Pool } from '../utils/pool.js';

const fetchProjects = async () => {
  try {
    const pages = await fetchAllPages(`/rest/api/3/project/search?orderBy=+key&startAt=%start%&maxResults=%max%`, 50);
    const values = pages.reduce((acc, page) => [...acc, ...page.values], []);
    const projects = values.map((_project) => {
      const { id, key, name, isPrivate, avatarUrls, self } = _project;
      const project = {
        id, key, name, isPrivate,
        avatarUrl: avatarUrls['48x48'] || '#',
        url: self.replace(/\/rest\/(.*)/,'') + `/browse/${key}`,
        data: _project,
      };
      return project;
    });
    return Promise.resolve(projects);
  } catch(error) {
    return Promise.reject(error);
  }
};

export const emptyProject = {
  id: '',
  key: '',
  name: '',
  isPrivate: false,
  avatarUrl: '#',
  url: '#',
  data: null,
}

export const projectPool = new Pool(emptyProject, null, fetchProjects);

isAuthenticated.subscribe((v) => {
  if (!v) {
    projectPool.kill();
  } else {
    projectPool.fetchAll();
  }
});
