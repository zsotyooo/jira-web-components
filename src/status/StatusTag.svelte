<script>
  import { statuses } from './status.js';
  import { createWatcher } from '../utils/helpers.js';

  export let sid = '';
  const watchSid = createWatcher(sid);

  let status = '';
  let ok;
  let fetching;
  let name = 'unknown status';

  let unsubs = [];

  export let getStatus = () => status;

  $: {
    watchSid.onChanged(sid, () => {
      if (sid) {
        console.log(sid);
        const _status = statuses.setItem(sid);
        unsubs.map(unsub => unsub());
        unsubs = [
          _status.data.subscribe(_statusData => status = _statusData),
          _status.ok.subscribe(_ok => {
            ok = _ok;
            if (ok) {
              name = status.name;
            }
          }),
          _status.fetching.subscribe(_fetching => fetching = _fetching),
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
  span.tag.is-loading {
    animation: borderAnim 0.5s ease-in-out infinite alternate;
  }
</style>

<svelte:options tag="jira-status-tag"/>

<span
  class="tag is-rounded"
  class:has-background-info={ok}
  class:is-loading={fetching}>
    <slot value={sid}></slot>
    <em>{name}</em>
</span>