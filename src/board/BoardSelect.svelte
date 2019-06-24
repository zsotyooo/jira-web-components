<script>
  import { createEventDispatcher } from 'svelte';
  import { getBoardsForProject } from './board.js';
  import { createWatcher } from '../utils/helpers.js';
  
  const dispatch = createEventDispatcher();

  export let selected = '';
  const watchSelected = createWatcher(selected);

  export let project = '';
  const watchProject = createWatcher(project);

  export let getBoard = () => {
    return board;
  }

  let board = null;
  let boards;
  let boardList = null;
  let fetching;
  let slot;

  let unsubs = [];

  $: {
    watchProject.onChanged(project, () => {
      unsubs.map(unsub => unsub());
      if (project) {
        boards = getBoardsForProject(project);
        unsubs = [
          boards.data.subscribe(_data => boardList = boards.getBoardArray()),
          boards.fetching.subscribe(_fetching => fetching = _fetching),
        ];
      } else {
        fetching = null;
        boards = null;
        boardList = null;
      }
      selected = '';
      assignNodes();
    });

    watchSelected.onChanged(selected, () => {
      if (selected) {
        board = boards.getItemData(selected);
      } else {
        board = null;
      }
      assignNodes();
      dispatch('jira-board-selected', board);
    });
  }

  const assignNodes = () => {
    slot.assignedNodes().map(el => {
      if (el.nodeType === Node.ELEMENT_NODE) {
        switch (el.tagName) {
          case 'JIRA-BOARD-PANEL':
            el.setAttribute('bid', selected || '');
          break;
        }
      }
    });
  }

  const onSlotChange = () => {
    assignNodes();
  };

  const onSelect = ({ target: { value }}) => {
    selected = Number(value);
  }
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
</style>

<svelte:options tag="jira-board-select" />
<div class="field is-horizontal">
  <label class="label field-label">Project boards:</label>
  <div class="control jira-board-select field-body">
    <div class="select"
      class:is-loading-bg={fetching} >
      <select on:change={onSelect}>
        <option value="">Please select {project} project board</option>
        {#if boardList}
          {#each boardList as { id, name, type }, i}
            <option value={id} selected={selected === id}>{ name}({type})</option>
          {/each}
        {/if}
      </select>
    </div>
  </div>
</div>
<slot on:slotchange={onSlotChange} bind:this={slot}></slot>