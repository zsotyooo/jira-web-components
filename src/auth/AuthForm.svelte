<script>
  import { onMount } from 'svelte';
  import { emptyUser } from './store.js';
  import Auth from './Auth.svelte';

  let authComponent;
  let fetching = false;
  let user = emptyUser;
  let authenticated = false;

  let email = '';
  let apiKey = '';
  let url = '';

  function onIsFechingChanged(e) {
    fetching = e.detail;
  }

  function onUserChanged(e) {
    user = e.detail;
  }

  function onAuthStatusChanged(e) {
    authenticated = e.detail;
  }

  function onEmailChanged(e) {
    email = e.detail;
  }

  function onApiKeyChanged(e) {
    apiKey = e.detail;
  }

  function onUrlChanged(e) {
    url = e.detail;
  }

  function save() {
    authComponent.setEmail(email);
    authComponent.setApiKey(apiKey);
    authComponent.setUrl(url);
  }

  function reset() {
    authComponent.reset();
    email = '';
    apiKey = '';
    url = '';
  }

  onMount(() => {
    email = authComponent.getEmail();
    apiKey = authComponent.getApiKey();
    url = authComponent.getUrl();
    authenticated = authComponent.isAuthenticated();
  });
</script>

<style>
  @import "bulma.css";
</style>

<svelte:options tag="jira-auth-form" />

<Auth
  bind:this={authComponent}
  on:jira-auth-user-changed={onUserChanged}
  on:jira-auth-user-fetching-changed={onIsFechingChanged}
  on:jira-auth-status-changed={onAuthStatusChanged}
  on:jira-auth-email-changed={onEmailChanged}
  on:jira-auth-api-key-changed={onApiKeyChanged}
  on:jira-auth-url-changed={onUrlChanged} />

<div class="box card container is-fluid is-paddingless">
  <header class="card-header">
    <p class="card-header-title">
      JiRa authentication
    </p>
  </header>
  <div class="card-content">
    <div class="content">
      {#if !authenticated}
      <div class="notification is-warning">
        Authentication error, please enter valid data.
      </div>
      {:else}
      <div class="notification is-success">
        You are authenticated as @{user.name}.
      </div>
      {/if}
      <div class="form-horizontal" >
        <fieldset>
          <div class="field">
            <label class="label" for="jira-email">E-mail</label>
            <div class="control">
              <input bind:value={email} id="jira-email" name="jira-email" type="text" placeholder="E-mail" class="input is-medium" required="">
              <p class="help">Your JiRa login E-mail.</p>
            </div>
          </div>

          <div class="field">
            <label class="label" for="jira-api-key">Api key</label>
            <div class="control">
              <input bind:value={apiKey} id="jira-api-key" name="jira-api-key" type="password" placeholder="Api key" class="input is-medium" required="">
              <p class="help">Create an API token <a target="_blank" href="https://id.atlassian.com/manage/api-tokens">here</a>.</p>
            </div>
          </div>

          <div class="field">
            <label class="label" for="jira-url">URL to JiRa</label>
            <div class="control">
              <input bind:value={url} id="jira-url" name="jira-url" type="text" placeholder="URL to JiRa" class="input is-medium" required="">
              <p class="help">Use the URL to your company JiRa account (E.g: https://your-company.jira.net).</p>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  </div>
  <footer class="card-footer">
    <span class="card-footer-item">
      <button on:click={save} class="button is-primary" class:is-loading={fetching} disabled={fetching || !email || !apiKey || !url}>{fetching ? 'Fetching user...' : 'Authenticate'}</button>
    </span>
    <span class="card-footer-item">
      <button on:click={reset} class="button is-white">clear</button>
    </span>
  </footer>
</div>