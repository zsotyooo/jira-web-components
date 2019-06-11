<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { issuePool } from './store.js';
  import { createOnceSubsciber, createWatcher } from '../utils/helpers.js';

  const dispatch = createEventDispatcher();

  export let key = '';
  const issueSub = createOnceSubsciber();
  const watchKey = createWatcher(key);

  let issue;
  
  const prevKey = '';
  $: {
    watchKey.onChanged(key, () => {
      if (key) {
        issuePool.addByKey(key);
        issue = issuePool.getByKey(key);
        issueSub.subscribe(issue, issueData => {
          dispatch('jira-issue-loaded', issueData);
        });
      }
    });
  }
</script>

<svelte:options tag="jira-issue"/>