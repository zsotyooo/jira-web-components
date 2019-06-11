<script>
  import { onMount, tick } from'svelte';
  import { corsUrl, isSafe } from './store.js';
  import { createWatcher } from '../utils/helpers.js';

  export let cors = null;
  export let safe = false;

  const watchCors = createWatcher(cors);
  const watchSafe = createWatcher(safe);

  $: {
    watchCors.onChanged(cors, () => {
      if (cors !== null) {
        corsUrl.set(cors);
      }
    });
    
    watchSafe.onChanged(safe, () => {
      isSafe.set(safe !== false && safe.toString().toLowerCase() !== 'false');
    });
  }
</script>

<svelte:options tag="jira-global-config"/>