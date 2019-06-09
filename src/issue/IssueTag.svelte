<script>
  import Issue from './Issue.svelte';

  export let key = '';

  let issue;

  function onIssueLoaded(e) {
    issue = e.detail;
  };
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
</style>

<svelte:options tag="jira-issue-tag"/>

<Issue {key} on:jira-issue-loaded={onIssueLoaded} />
<a
  href={issue ? issue.url : '#'}
  target="_blank"
  class="tag is-rounded"
  class:is-warning={issue && issue.id}>
  <strong>{key}</strong>
  {#if issue && issue.summary }
    <span>: {issue.summary}</span>
  {/if}
  {#if issue && issue.status }
    <em>({issue.status})</em>
  {/if}
</a>