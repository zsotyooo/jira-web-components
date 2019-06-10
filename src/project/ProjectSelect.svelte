<script>
  import { createEventDispatcher } from 'svelte';
  import Projects from './Projects.svelte';

  const dispatch = createEventDispatcher();

  let project = null;
  let projects = [];
  let fetching = false;

  export let getProject = () => project;

  const onProjectsLoaded = (e) => {
    projects = e.detail;
  }

  const onFetchingChanged = (e) => {
    fetching = e.detail;
  }

  const onSelect = (e) => {
    const key = e.target.value;
    if (!key) {
      project = null;
    } else {
      project = projects.find(p => p.key === key);  
    }
    dispatch('jira-project-selected', project);
  }
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
  .jira-project-select.control .select {
    width: 100%;
    max-width: 300px;
    select {
      width: 100%;
    }
  }
</style>

<svelte:options tag="jira-project-select" />

<Projects
  on:jira-projects-loaded={onProjectsLoaded}
  on:jira-projects-fetching-changed={onFetchingChanged} />

<div class="control jira-project-select">
  <div class="select"
    class:is-loading={fetching} >
    <select on:change={onSelect}>
      <option value="">Please select project</option>
      {#each projects as { id, key, name }, i}
        <option value={key}>{key}: { name}</option>
      {/each}
    </select>
  </div>
</div>