<script>
  import { createEventDispatcher, onMount, afterUpdate, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { projectPool, projectsAreFetchig } from './store.js';

  export let key;

  const dispatch = createEventDispatcher();

  let project = null;

  const prevKey = null;
  
  export let getProject = () => project;

  projectPool.subscribe(pool => {
    const p = projectPool.getByKey(key);
    if (!project || p.key !== project.key) {
      project = p;
    }
  });

  $: {
    if (key && prevKey !== key) {
      project = projectPool.getByKey(key);
      if (!project) {
        projectPool.fetchAll();
      }
    }
  }
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
</style>

<svelte:options tag="jira-project-card" />

{#if $projectsAreFetchig }
  <p class="box container is-fluid notification is-warning">
    <button class="button is-warning is-loading is-small"></button>
  </p>
{:else if project}
<div class="box container is-fluid">
  <article class="media">
    <div class="media-left">
      <figure class="image is-48x48">
        <img src={project.avatarUrl} alt="Image">
      </figure>
    </div>
    <div class="media-content">
      <div class="content">
        <p>
          <strong>{project.key}</strong> <small>({project.isPrivite ? 'private' : 'public'})</small>
          <br>
          <small><a href={project.url} target="_href">{project.name}</small>
        </p>
      </div>
    </div>
  </article>
</div>
{:else}
  <div class="notification is-warning">
    {key} project found or you have no permission to see it!
  </div>
{/if}