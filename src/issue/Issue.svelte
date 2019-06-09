<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { issuePool, emptyIssue } from './store.js';
  import { isAuthenticated } from '../auth/store.js';

  const dispatch = createEventDispatcher();

  export let key = '';

  let issue = emptyIssue;

  const load = () => {
    issue = issuePool.getByKey(key);
    dispatch('jira-issue-loaded', issue);
  }

  issuePool.subscribe(pool => {
    load();
  });

  isAuthenticated.subscribe(v => {
    if (v) {
      load();
    } else {
      issue = emptyIssue;
      dispatch('jira-issue-loaded', issue);
    }
  });

  onMount(async () => {
    await tick();
    issuePool.addByKey(key);
  });
</script>

<svelte:options tag="jira-issue"/>