<script>
  import { auth } from '../auth/auth.js';
  import { issues } from './issue.js';
  import { createWatcher } from '../utils/helpers.js';

  export let key;
  const watchKey = createWatcher(key);

  let baseUrl = auth.url;
  let issue;
  let ok;
  let fetching;

  let unsubs = [];

  $: url = $baseUrl + '/browse/' + key;

  $: {
    watchKey.onChanged(key, () => {
      if (key) {
        const _issue = issues.setItem(key);
        unsubs.map(unsub => unsub());
        unsubs = [
          _issue.data.subscribe(_issueData => issue = _issueData),
          _issue.ok.subscribe(_ok => ok = _ok),
          _issue.fetching.subscribe(_fetching => fetching = _fetching),
        ];
      }
    });
  }
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
  @keyframes borderAnim {
    0% {
      box-shadow: inset 0px 0px 1px whitesmoke;
    }
    100% {
      box-shadow: inset 0px 0px 3px 3px #ffdd57;
    }
  }
  @keyframes blink {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  a.tag.is-loading {
    animation: borderAnim 0.5s ease-in-out infinite alternate;
  }
  a.tag:before {
    content: '\2022';
    font-size: 30px;
    line-height: 0.6;
    margin-top: -0.2em;
    margin-right: 0.15em;
  }
  a.tag:hover {
    text-decoration: none;
  }
  a.tag.is-loading:before {
    color: #ffdd57;
    animation: blink 0.5s ease-in-out infinite alternate;
  }
</style>

<svelte:options tag="jira-issue-tag"/>

<a
  href={url}
  target="_blank"
  class="tag is-rounded"
  class:is-warning={ok}
  class:is-loading={fetching}>
  <strong>{key}</strong>
  {#if ok }
    <span>: {issue.summary}</span>
    <em>({issue.status})</em>
  {/if}
</a>