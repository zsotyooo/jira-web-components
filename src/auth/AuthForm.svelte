<script>
  import { createEventDispatcher } from 'svelte';
  import { auth } from './auth.js';
  import { authUser as user } from './authUser.js';

  const dispatch = createEventDispatcher();

  let { fetching, authenticated } = user;

  export let email = '';
  export let apikey = '';
  export let url = '';

  auth.email.subscribe(_email => {
    email = _email;
  });

  auth.apiKey.subscribe(_apiKey => {
    apikey = _apiKey;
  });

  auth.url.subscribe(_url => {
    url = _url;
  });

  function save() {
    auth.setEmail(email);
    auth.setApiKey(apikey);
    auth.setUrl(url);
    user.authenticate();
    dispatch('jira-auth-form-saved', { email, apikey, url});
  }

  function logOut() {
    auth.reset();
    user.reset();
  }
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
</style>

<svelte:options tag="jira-auth-form" />

<div class="box card container is-fluid is-paddingless">
  <header class="card-header">
    <p class="card-header-title">
      JiRa authentication
    </p>
  </header>
  <div class="card-content">
    <div class="content">
      {#if $fetching }
        <p class="notification is-warning">
          <button class="button is-warning is-loading is-small"></button>
        </p>
      {:else if !$authenticated}
        <div class="notification is-warning">
          Authentication error, please enter valid data.
        </div>
      {:else}
        <div class="notification is-success">
          You are authenticated as @{$user.name}.
        </div>
      {/if}
      <div class="form-horizontal" >
        <fieldset>
          <div class="field is-horizontal">
            <label class="label field-label" for="jira-email">E-mail</label>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input bind:value={email} id="jira-email" name="jira-email" type="text" placeholder="E-mail" class="input is-medium" required="">
                </div>
                <p class="help">Your JiRa login E-mail.</p>
              </div>
            </div>
            
          </div>

          <div class="field is-horizontal">
            <label class="label field-label" for="jira-api-key">Api key</label>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input bind:value={apikey} id="jira-api-key" name="jira-api-key" type="password" placeholder="Api key" class="input is-medium" required="">
                </div>
                <p class="help">Create an API token <a target="_blank" href="https://id.atlassian.com/manage/api-tokens">here</a>.</p>
              </div>
            </div>
          </div>

          <div class="field is-horizontal">
            <label class="label field-label" for="jira-url">URL to JiRa</label>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input bind:value={url} id="jira-url" name="jira-url" type="text" placeholder="URL to JiRa" class="input is-medium" required="">
                </div>
                <p class="help">Use the URL to your company JiRa account (E.g: https://your-company.atlassian.net).</p>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  </div>
  <footer class="card-footer">
    <span class="card-footer-item">
      <button on:click={save} class="button is-primary" class:is-loading={$fetching} disabled={$fetching || !email || !apikey || !url}>{$fetching ? 'Fetching user...' : 'Authenticate'}</button>
    </span>
    <span class="card-footer-item">
      <button on:click={logOut} class="button is-white">Log out</button>
    </span>
  </footer>
</div>