<script>
  import { onMount, tick } from'svelte';
  import { corsUrl, userSecret } from './store.js';
  import { createWatcher } from '../utils/helpers.js';

  export let cors = null;
  export let secret = null;

  const watchCors = createWatcher(cors);
  const watchSecret = createWatcher(secret);

  $: {
    watchCors.onChanged(cors, () => {
      if (cors !== null) {
        corsUrl.set(cors);
      }
    });
    
    watchSecret.onChanged(secret, () => {
      if (secret !== null) {
        userSecret.set(secret);
      }
    });
  }
</script>

<svelte:options tag="jira-global-config"/>