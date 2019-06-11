<script>
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { createWatcher } from '../utils/helpers.js';
  import Projects from './Projects.svelte';

  const dispatch = createEventDispatcher();

  export let getProject = () => project;

  let projects;
  let projectsComponent;
  const watchProjects = createWatcher(projects);
  let isFetching = false;

  function onProjectsLoaded({ detail }) {
    projects = detail.map(p => get(p));
  };

  function onFetchingChanged({ detail }) {
    isFetching = detail;
  };

  const onSelect = ({ target: { value }}) => {
    const key = value;
    let project = null;
    if (key) {
      project = get(projectsComponent.getProject(key));
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
  bind:this={projectsComponent}
  on:jira-projects-loaded={onProjectsLoaded}
  on:jira-projects-fetching-changed={onFetchingChanged}/>

<div class="control jira-project-select container is-fluid">
  <div class="select"
    class:is-loading={isFetching} >
    <select on:change={onSelect}>
      <option value="">Please select project</option>
      {#if projects}
        {#each projects as { id, key, name }, i}
          <option value={key}>{key}: { name}</option>
        {/each}
      {/if}
    </select>
  </div>
</div>