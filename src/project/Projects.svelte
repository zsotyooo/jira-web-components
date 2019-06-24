<script>
  import { createEventDispatcher } from 'svelte';
  import { projects } from './project.js';
  const dispatch = createEventDispatcher();

  export let fetchProjects = async () => await projects.fetchAll();

  export let getProjects = () => projects.getProjectArray();
  export let getProject = (key) => projects.getItemData(key);

  projects.loaded.subscribe(_loaded => {
    dispatch('jira-projects-loaded', _loaded);
  });

  projects.fetching.subscribe(_fetching => {
    dispatch('jira-projects-fetching-changed', _fetching);
  });
</script>

<svelte:options tag="jira-projects" />