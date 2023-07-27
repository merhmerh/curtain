import { writable } from 'svelte/store';

export const isEditMode = writable(0);

export const config = writable(0);

export const blockGlobalShortcut = writable(0)

export const markedIsInitialized = writable(0)

export const session = writable({})