<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { projectPool, projectsAreFetchig } from './store.js';
  const dispatch = createEventDispatcher();

  export let fetchProjects = async () => {
    const data = await projectPool.fetchAll();
    dispatch('jira-projects-loaded', data);
    return data;
  };

  projectPool.subscribe((v) => {
    dispatch('jira-projects-changed', v);
  });

  projectsAreFetchig.subscribe((v) => {
    dispatch('jira-projects-fetching-changed', v);
  });

  onMount(async () => {
    await tick();
    fetchProjects();
  });
</script>

<svelte:options tag="jira-projects" />