<script>
  import { createEventDispatcher } from 'svelte';
  import { get } from 'svelte/store';
  import { auth } from './auth.js';
  import { authUser } from './authUser.js';

  const dispatch = createEventDispatcher();

  export let setEmail = (v) => auth.setEmail(v);
  export let setApiKey = (v) => auth.setApiKey(v);
  export let setUrl = (v) => auth.setUrl(v);
  export let getUserData = () => authUser.getUserData();

  export let getEmail = () => auth.getEmail();
  export let getApiKey = () => auth.getApiKey();
  export let getUrl = () => auth.getUrl();

  export let authenticate = async () => authUser.authenticate();

  export let isAuthenticated = () => authUser.isAuthenticated;
  export let isFetching = () => authUser.isFetching;

  authUser.subscribe(user => {
    dispatch('jira-auth-user-changed', user);
    dispatch('jira-auth-status-changed', !!user.accountId);
  });

  authUser.fetching.subscribe(fetching => dispatch('jira-auth-user-fetching-changed', fetching));
  auth.email.subscribe(email => dispatch('jira-auth-email-changed', email));
  auth.apiKey.subscribe(apiKey => dispatch('jira-auth-apikey-changed', apiKey));
  auth.url.subscribe(url => dispatch('jira-auth-url-changed', url));

  export let reset = () => {
    setEmail('');
    setApiKey('');
    setUrl('');
  }
</script>

<svelte:options tag="jira-auth"/>