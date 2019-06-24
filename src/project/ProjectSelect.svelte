<script>
  import { createEventDispatcher } from 'svelte';
  import { createWatcher } from '../utils/helpers.js';
  import { projects } from './project.js';

  const dispatch = createEventDispatcher();

  export let selected = '';
  const watchSelected = createWatcher(selected);

  export let getProject = () => project;

  let project = null;
  let projectList = null;
  let fetching;
  let ok;
  let slot;

  let unsubs = [];

  projects.data.subscribe(_projectsData => projectList = projects.getProjectArray());
  projects.ok.subscribe(_ok => ok = _ok);
  projects.fetching.subscribe(_fetching => fetching = _fetching);

  $: {
    watchSelected.onChanged(selected, () => {
      unsubs.map(unsub => unsub());
      if (selected) {
        unsubs = [
          projects.getItem(selected).subscribe(_projectsData => project = projects.getItemData(selected)),
        ];
      } else {
        project = null;
      }
      assignNodes();
      dispatch('jira-project-selected', project);
    });
  }

  const assignNodes = () => {
    slot.assignedNodes().map(el => {
      if (el.nodeType === Node.ELEMENT_NODE) {
        switch (el.tagName) {
          case 'JIRA-PROJECT-CARD':
            el.setAttribute('key', selected);
          break;
          case 'JIRA-BOARD-SELECT':
            el.setAttribute('project', selected);
            el.setAttribute('selected', '');
          break;
        }
      }
    });
  };

  const onSlotChange = () => {
    assignNodes();
  };

  const onSelect = ({ target: { value }}) => {
    selected = value;
  };
</script>

<style lang="sass">
  @import "node_modules/bulma/bulma";
  @keyframes borderAnim {
    0% {
      box-shadow: inset 0px 0px 1px whitesmoke;
    }
    100% {
      box-shadow: inset 0px 0px 3px 3px #ffdd57;;
    }
  }
  .select.is-loading-bg select {
    animation: borderAnim 0.5s ease-in-out infinite alternate;
  }
  :host {
    width: 100%;
  }
</style>

<svelte:options tag="jira-project-select" />

<div class="box container is-fluid">
  <div class="field is-horizontal">
    <label class="label field-label">Project:</label>
    <div class="control field-body jira-project-select">
      <div class="select"
        class:is-loading-bg={fetching} >
        <select on:change={onSelect}>
          <option value="">Please select project</option>
          {#if projectList}
            {#each projectList as { id, key, name }, i}
              <option value={key} selected={selected === key}>{key}: { name}</option>
            {/each}
          {/if}
        </select>
      </div>
    </div>
  </div>
  <slot on:slotchange={onSlotChange} bind:this={slot}></slot>
</div>