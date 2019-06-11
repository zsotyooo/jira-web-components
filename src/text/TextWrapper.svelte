<script>
  import { onMount, tick } from 'svelte';
  import { processText } from '../utils/helpers.js';

  let processedText = '';

  function processSlot(e) {
    e.target.assignedNodes().map(el => {
      if (el.nodeType === Node.TEXT_NODE) {
        processedText += processText(el.textContent);
      } else if (el.nodeType === Node.ELEMENT_NODE) {
        processedText += processText(el.outerHTML);
      } else {
        processedText += el.outerHTML;
      }
    });
  }
</script>

<svelte:options tag="jira-text-wrapper" />

<div style="display: none">
  <slot on:slotchange={processSlot}></slot>
</div>
<div class="jira--text">
  {@html processedText}
</div>