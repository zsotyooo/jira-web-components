<script>
  import { createWatcher } from '../utils/helpers.js';
  import Projects from './Projects.svelte';

  export let key;
  const watchKey = createWatcher(key);

  let projectsComponent;

  let project;
  const watchProject = createWatcher(project);
  let projectData;
  let isFetching = false;

  function onProjectsLoaded() {
    if (!project || project.key !== key) {
      project = projectsComponent.getProject(key);
    }
  };

  function onFetchingChanged({ detail }) {
    isFetching = detail;
  };

  $: {
    watchKey.onChanged(key, () => {
      if (key) {
        project = projectsComponent.getProject(key);
      }
    });
    watchProject.onChanged(project, () => {
      if (project) {
        project.subscribe(p => {
          projectData = p;
        });
      } else {
        projectData = null;
      }
    });
  }
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
</style>

<svelte:options tag="jira-project-card" />

<Projects 
  bind:this={projectsComponent}
  on:jira-projects-loaded={onProjectsLoaded}
  on:jira-projects-fetching-changed={onFetchingChanged}/>
{#if key}
  {#if isFetching }
    <p class="box container is-fluid notification is-warning">
      <button class="button is-warning is-loading is-small"></button>
    </p>
  {:else if projectData}
    <div class="box container is-fluid is-info notification">
      <article class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img src={projectData.avatarUrl} alt="Image">
          </figure>
        </div>
        <div class="media-content">
          <div class="content">
            <p>
              <strong>{projectData.key}</strong> <small>({projectData.isPrivite ? 'private' : 'public'})</small>
              <br>
              <small><a href={projectData.url} target="_href">{projectData.name}</small>
            </p>
          </div>
        </div>
      </article>
    </div>
  {:else}
    <div class="notification is-warning">
      {key} project not found or you have no permission to see it!
    </div>
  {/if}
{/if}