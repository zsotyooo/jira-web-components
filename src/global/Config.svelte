<script>
  import { onMount, tick } from'svelte';
  import { corsUrl, userSecret } from './store.js';

  export let cors = null;
  const prevCors = null;

  export let secret = null;
  const prevSecret = null;

  $: {
    if (cors !== null && prevCors !== cors) {
      corsUrl.set(cors);
    }
    if (secret !== null && prevSecret !== secret) {
      userSecret.set(secret);
    }
  }
</script>

<svelte:options tag="jira-global-config"/>