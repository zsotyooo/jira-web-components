import { writable } from 'svelte/store';

export let corsUrl = writable('');

export let userSecret = writable('');