<script>
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { email, apiKey, url, authUser, authUserIsFetching } from './store.js';

  const dispatch = createEventDispatcher();

  export let setEmail = (v) => email.set(v);
  export let setApiKey = (v) => apiKey.set(v);
  export let setUrl = (v) => url.set(v);
  export let getUserData = () => get(authUser);

  export let getEmail = () => $email;
  export let getApiKey = () => $apiKey;
  export let getUrl = () => $url;

  export let isAuthenticated = () => !!$authUser.accountId;

  authUser.subscribe(user => {
    dispatch('jira-auth-user-changed', user);
    dispatch('jira-auth-status-changed', !!user.accountId);
  });

  authUserIsFetching.subscribe(v => dispatch('jira-auth-user-fetching-changed', v));
  email.subscribe(v => dispatch('jira-auth-email-changed', v));
  apiKey.subscribe(v => dispatch('jira-auth-apikey-changed', v));
  url.subscribe(v => dispatch('jira-auth-url-changed', v));

  export let reset = () => {
    setEmail('');
    setApiKey('');
    setUrl('');
  }
</script>

<svelte:options tag="jira-auth"/>