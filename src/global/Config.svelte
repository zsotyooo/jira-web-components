<script>
  import { config } from './global-config.js';
  import { createWatcher } from '../utils/helpers.js';

  export let cors = null;
  export let safe = null;

  const watchCors = createWatcher(cors);
  const watchSafe = createWatcher(safe);

  $: {
    watchCors.onChanged(cors, () => {
      if (cors !== null) {
        config.setCorsUrl(cors);
      }
    });
    
    watchSafe.onChanged(safe, () => {
      if (safe !== null) {
        config.setIsSafe(safe);
      }
    });
  }
</script>

<svelte:options tag="jira-global-config"/>