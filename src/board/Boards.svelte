<script>
  import { createEventDispatcher } from 'svelte';
  import { getBoardsForProject } from './board.js';
  import { createWatcher } from '../utils/helpers.js';
  
  const dispatch = createEventDispatcher();

  export let project = '';
  const watchProject = createWatcher(project);

  let boards;

  export let fetchBoards = async () => {
    if (!boards) {
      return Promise.reject('Component not loaded yet!');
    }
    return boards.fetchAll();
  };

  export let setProject = (key) => project = key;

  export let getBoards = () => {
    if (!boards) {
      return [];
    }
    return boards.getBoardArray();
  }

  let unsubs = [];

  $: {
    watchProject.onChanged(project, () => {
      unsubs.map(unsub => unsub());
      if (project) {
        boards = getBoardsForProject(project);
        unsubs = [
          boards.loaded.subscribe(_loaded => dispatch('jira-boards-loaded', _loaded)),
          boards.fetching.subscribe(_fetching => dispatch('jira-boards-fetching-changed', _fetching)),
        ];
      } else {
        boards = null;
      }
    });
  }
</script>

<svelte:options tag="jira-boards" />