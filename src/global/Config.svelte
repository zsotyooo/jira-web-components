<script>
  import { onMount, tick } from'svelte';
  import { hydrateData } from '../utils/storage.js';

  export let cors;

  onMount(async () => {
    await tick();
    hydrateData('cors', cors);
  });
</script>

<svelte:options tag="jira-global-config"/>