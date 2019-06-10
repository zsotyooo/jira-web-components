<script>
  import { createEventDispatcher } from 'svelte';
  import { isAuthenticated } from '../auth/store.js';
  import { projectPool, projectsAreFetchig } from './store.js';

  const dispatch = createEventDispatcher();

  projectPool.fetchAll();

  isAuthenticated.subscribe(v => {
    if (v) {
      projectPool.fetchAll();      
    }
  });

  export let getProject = () => project;

  const onSelect = (e) => {
    const key = e.target.value;
    let project = null;
    if (key) {
      project = projectPool.getByKey(key);
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

<div class="control jira-project-select container is-fluid">
  <div class="select"
    class:is-loading={$projectsAreFetchig} >
    <select on:change={onSelect}>
      <option value="">Please select project</option>
      {#if $projectPool}
        {#each $projectPool as { id, key, name }, i}
          <option value={key}>{key}: { name}</option>
        {/each}
      {/if}
    </select>
  </div>
</div>