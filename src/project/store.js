import { writable, get } from 'svelte/store';
import { fetchAllPages, tick } from '../utils/api.js';

const fetchProjects = async () => {
  await tick(100);
  try {
    projectPool.reset();
    projectsAreFetchig.set(true);
    const pages = await fetchAllPages(`/rest/api/3/project/search?orderBy=+key&startAt=%start%&maxResults=%max%`, 50);
    projectsAreFetchig.set(false);
    const values = pages.reduce((acc, page) => [...acc, ...page.values], []);
    const projects = values.map((_project) => {
      const { id, key, name, isPrivate, avatarUrls, self } = _project;
      const project = {
        id, key, name, isPrivate,
        avatarUrl: avatarUrls['48x48'] || '#',
        url: self.replace(/\/rest\/(.*)/,'') + `/browse/${key}`,
        data: _project,
      };
      projectPool.add(project);
      return project;
    });

    return Promise.resolve(projects);

  } catch(error) {
    projectsAreFetchig.set(false);
    return Promise.reject(error);
  }
};

const addToPool = (pool, project) => {
  const ret = [...pool];
  const foundIndex = ret.findIndex((_project) => _project.key === project.key);
  if (foundIndex > -1) {
    ret[foundIndex] = project;
  } else {
    ret.push(project);
  }
  return ret;
}

export let projectsAreFetchig = writable(false);

export const projectPool = (() => {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    fetchAll: async () => {
      return await fetchProjects();
    },
    add: (project) => update(pool => {
      return addToPool(pool, project);
    }),
    reset: () => set([]),
    getByKey: (key) => get(projectPool).find(_project => _project.key === key),
  };
})();