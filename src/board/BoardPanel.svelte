<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { createOnceSubsciber, createWatcher } from '../utils/helpers.js';
  import StatusTag from '../status/StatusTag.svelte';
  import { getConfigForBoard } from './board.js';

  const dispatch = createEventDispatcher();

  export let bid = '';
  export let showstatuses = false;
  export let showcheckboxes = false;
  let idWatcher = createWatcher(bid);

  let fetching;
  let ok;
  let loaded;

  let config;
  let configData;

  let statusTags = {};
  let statusCheckboxes = {};

  export let getStatuses = () => Object.keys(statusTags).filter(id => statusTags[id] !== null ).map(id => ({...statusTags[id].getStatus(), selected: statusCheckboxes[id].checked})).filter(s => s.ok);

  $: columns = configData && configData.columnConfig && configData.columnConfig.columns;
  $: name = configData && configData.name;
  $: location = configData && configData.location && configData.location.name;

  let unsubs = [];
  $: {
    idWatcher.onChanged(bid, () => {
      unsubs.map(unsub => unsub());
      if (bid) {
          config = getConfigForBoard(Number(bid));
          unsubs = [
            config.data.subscribe(_data => configData = _data),
            config.ok.subscribe(_ok => ok = _ok),
            config.loaded.subscribe(_loaded => loaded = _loaded),
            config.fetching.subscribe(_fetching => fetching = _fetching),
          ];
      } else {
        config = null;
        fetching = null;
        ok = null;
        loaded = false;
        configData = null;
      }
    });
  }

  function handleStatusCbChange({ target }) {
    const value = Number(target.value);
    dispatch('jira-board-panel-status-selected', {
      selected: target.checked,
      value,
      status: statusTags[value].getStatus(),
    });
  }
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
</style>

<svelte:options tag="jira-board-panel" />

{#if fetching }
    <p class="box container is-fluid notification is-warning">
      <button class="button is-warning is-loading is-small"></button>
    </p>
{:else if ok}
  <div class="card">
    {#if location && name }
      <header class="card-header">
        <p class="card-header-title">
          {location} &gt; {name}
        </p>
      </header>
    {/if}
    <div class="card-content">
      <div class="content columns is-desktop is-multiline">
        {#if columns}
          {#each columns as { name, statuses }, i}
            <div class="column is-one-quarter">
              <div class="notification has-background-grey-light">
                <p><small><strong>{name}</strong></small></p>
                {#if statuses && showstatuses }
                  <ul>
                    {#each statuses as { id }, i}
                      <li>
                        <jira-status-tag sid={id} bind:this={statusTags[id]}>
                          {#if showcheckboxes}
                            <input type="checkbox" checked="true" value={id} on:change={handleStatusCbChange}  bind:this={statusCheckboxes[id]}/>
                          {/if}
                        </jira-status-tag>
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{:else if loaded}
  <div class="notification is-warning">
    Board not found or you have no permission to see it!
  </div>
{/if}