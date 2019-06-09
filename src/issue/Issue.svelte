<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { issuePool, emptyIssue } from './store.js';
  import { isAuthenticated } from '../auth/store.js';

  const dispatch = createEventDispatcher();

  export let key;

  let issue = emptyIssue;

  issuePool.subscribe(pool => {
    issue = issuePool.getByKey(key);
  });

  isAuthenticated.subscribe(v => {
    if (v) {
      issue = issuePool.getByKey(key);
    } else {
      issue = emptyIssue;
    }
  });

  onMount(async () => {
    await tick();
    issuePool.addByKey(key);
  });
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
</style>

<svelte:options tag="jira-issue"/>

<a
  href={issue ? issue.url : '#'}
  target="_blank"
  class="tag is-rounded"
  class:is-warning={$isAuthenticated && issue && issue.id}>
  <strong>{key}</strong>
  {#if issue && issue.summary }
    <span>: {issue.summary}</span>
  {/if}
  {#if issue && issue.status }
    <em>({issue.status})</em>
  {/if}
</a>