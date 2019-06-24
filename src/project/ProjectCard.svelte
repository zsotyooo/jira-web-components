<script>
  import { auth } from '../auth/auth.js';
  import { projects } from './project.js';
  import { createWatcher, createOnceSubsciber } from '../utils/helpers.js';

  export let key = '';
  const watchKey = createWatcher(key);

  let baseUrl = auth.url;
  let project;
  let ok;
  let fetching;
  let avatarSrc;
  let unsubs = [];

  $: url = $baseUrl + '/browse/' + key;
  
  projects.ok.subscribe(_ok => ok = _ok);
  projects.fetching.subscribe(_fetching => fetching = _fetching);

  $: avatarSrc = project && project.avatarUrls['48x48'];

  $: {
    watchKey.onChanged(key, () => {
      if (key) {
        unsubs.map(unsub => unsub());
        unsubs = [
          projects.data.subscribe(_projectsData => {
            project = projects.getItemData(key)
          }),
        ];
      }
    });
  }

  const onAvatarError = (e) => {
    avatarSrc = `https://avatars.dicebear.com/v2/identicon/${project.key}.svg`;
  }
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
</style>

<svelte:options tag="jira-project-card" />

{#if key}
  {#if fetching }
    <p class="box container is-fluid notification is-warning">
      <button class="button is-warning is-loading is-small"></button>
    </p>
  {:else if ok}
    <div class="box container is-fluid is-info notification">
      <article class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img width="48" height="48" src={avatarSrc} alt="avatar" on:error={onAvatarError}>
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
      {key} project not found or you have no permission to see it!
    </div>
  {/if}
{/if}