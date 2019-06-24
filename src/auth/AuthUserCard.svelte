<script>
  import { authUser } from './authUser.js';

  let fetching;
  let user;
  let authenticated;

  authUser.subscribe(_user => {
    user = _user;
  });

  authUser.fetching.subscribe(_fetching => {
    fetching = _fetching;
  });

  authUser.authenticated.subscribe(_authenticated => {
    authenticated = _authenticated;
  });

</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
  @keyframes borderAnim {
    0% {
      box-shadow: inset 0px 0px 1px whitesmoke;
    }
    100% {
      box-shadow: inset 0px 0px 50px 50px #ffdd57;;
    }
  }
  .authuser-card.is-loading {
    animation: borderAnim 0.5s ease-in-out infinite alternate;
  }
</style>

<svelte:options tag="jira-auth-user-card" />

<div class="box container is-fluid authuser-card"
  class:is-loading={fetching}>
  <article class="media">
    <div class="media-left">
      <figure class="image is-48x48">
        <img src={user.avatarUrls['48x48']} alt="">
      </figure>
    </div>
    <div class="media-content">
      <div class="content">
        {#if authenticated }
          <p>
            <strong>{user.displayName}</strong> <small>@{user.name}</small>
            <br>
            <small>{user.emailAddress}</small>
          </p>
        {:else}
          <p>
            <strong>
              You are not logged in.
            </strong>
            <br>
            <small>Please log in with an <a target="_blank" href="https://id.atlassian.com/manage/api-tokens">API key</a>.</small>
          </p>
        {/if}
      </div>
    </div>
  </article>
</div>