<script>
  import { emptyUser } from './store.js';
  import Auth from './Auth.svelte';

  let authComponent;
  let fetching = false;
  let user = emptyUser;

  function onIsFechingChanged(e) {
    fetching = e.detail;
  }

  function onUserChanged(e) {
    user = e.detail;
  }
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
</style>

<svelte:options tag="jira-auth-user-card"/>

<Auth
  bind:this={authComponent}
  on:jira-auth-user-changed={onUserChanged}
  on:jira-auth-user-fetching-changed={onIsFechingChanged} />

{#if fetching }
  <p class="box container is-fluid notification is-warning">
    <button class="button is-warning is-loading is-small"></button>
  </p>
{:else if user.accountId }
  <div class="box container is-fluid">
    <article class="media">
      <div class="media-left">
        <figure class="image is-48x48">
          <img src={user.avatar} alt="Image">
        </figure>
      </div>
      <div class="media-content">
        <div class="content">
          <p>
            <strong>{user.displayName}</strong> <small>@{user.name}</small>
            <br>
            <small>{user.emailAddress}</small>
          </p>
        </div>
      </div>
    </article>
  </div>
{:else}
  <div class="notification is-warning">
    You are not logged in!
  </div>
{/if}