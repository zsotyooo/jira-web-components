<script>
  import { createEventDispatcher } from 'svelte';
  import { issues } from './issue.js';
  import { createWatcher } from '../utils/helpers.js';
  const dispatch = createEventDispatcher();

  export let key;
  const watchKey = createWatcher(key);

  export let getIssue = () => issues.getItemData(key);

  let unsubs = [];

  $: {
    watchKey.onChanged(key, () => {
      if (key) {
        const _issue = issues.setItem(key);
        unsubs.map(unsub => unsub());
        unsubs = [
          _issue.loaded.subscribe(_loaded => dispatch('jira-issue-loaded', _loaded)),
          _issue.fetching.subscribe(_fetching => dispatch('jira-issue-fetching-changed', _fetching)),
        ];
      }
    });
  }
</script>

<svelte:options tag="jira-issue"/>