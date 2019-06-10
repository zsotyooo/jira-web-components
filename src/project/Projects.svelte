<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { isAuthenticated } from '../auth/store.js';
  import { projectPool, projectsAreFetchig } from './store.js';
  const dispatch = createEventDispatcher();

  export let fetchProjects = async () => {
    const data = await projectPool.fetchAll();
    return data;
  };

  export let getProjects = get(projectPool);

  projectPool.subscribe((v) => {
    dispatch('jira-projects-changed', v);
  });

  projectsAreFetchig.subscribe((v) => {
    dispatch('jira-projects-fetching-changed', v);
  });

  isAuthenticated.subscribe((v) => {
    if (v) {
      fetchProjects();
    }
  });
</script>

<svelte:options tag="jira-projects" />