<script>
  import { onMount } from 'svelte';

  import AuthForm from './auth/AuthForm.svelte';
  import AuthUserCard from './auth/AuthUserCard.svelte';
  import Styles from './global/Styles.svelte';
  import Styles from './global/Styles.svelte';
</script>

<style>
  @import "bulma.css";
  @import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.2/css/all.css";
</style>

<svelte:options tag="jira-testapp"/>

<Styles />
<AuthUserCard />
<AuthForm />
