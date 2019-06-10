<script>
  import { onMount, tick } from'svelte';
  import { hydrateData } from '../utils/storage.js';

  export let cors = null;

  const prevCors = null;

  $: {
    if (cors && prevCors !== cors) {
      hydrateData('cors', cors);  
    }
  }
</script>

<svelte:options tag="jira-global-config"/>