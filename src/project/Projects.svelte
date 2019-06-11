<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { isAuthenticated } from '../auth/store.js';
  import { projectPool } from './store.js';
  const dispatch = createEventDispatcher();

  export let fetchProjects = async () => {
    const data = await projectPool.fetchAll();
    return data;
  };

  export let getProjects = get(projectPool);
  export let getProject = (key) => {
    return projectPool.getByKey(key);
  };

  projectPool.subscribe((projects) => {
    dispatch('jira-projects-loaded', projects);
  });

  projectPool.getIsFetching().subscribe((fetching) => {
    dispatch('jira-projects-fetching-changed', fetching);
  });
</script>

<svelte:options tag="jira-projects" />