<script>
import Icon from '@iconify/svelte';
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

export let input;
let original = input;
let inputBox;
let listening;
let placeholder;

function listenToInput(e) {
    placeholder = false;
    dispatch('listening');

    input = {};
    input.metaKey = e.metaKey;
    input.altKey = e.altKey;
    input.ctrlKey = e.ctrlKey;
    input.shiftKey = e.shiftKey;
    const ignore = ['Control', 'Alt', 'Shift', 'Meta'];
    input.key = getKey(e.key);
    original = input;
    function getKey(k) {
        if (ignore.includes(k)) {
            return '';
        }
        if (e.code == 'Space') {
            return 'Space';
        }
        return k;
    }
}

function release() {
    placeholder = false;
    console.log(placeholder);
    inputBox.blur();
    dispatch('release', input);
}
</script>

<svelte:window
    on:click={(e) => {
        if (!listening) return;
        if (e.target !== inputBox) {
            listening = false;
            placeholder = false;
            input = original;
        }
    }} />

<div class="div">
    <button
        bind:this={inputBox}
        on:input={(e) => {
            e.target.value = '';
        }}
        on:click={() => {
            listening = true;
            input = {};
            placeholder = true;
        }}
        on:keydown={listenToInput}
        on:keyup={release}>
        {#if placeholder}
            <div class="placeholder">Press a combination of keys to change this shortcut</div>
        {/if}

        <div class="keys">
            {#if input.metaKey}
                <div class="key">
                    <Icon icon="simple-icons:windows" />
                </div>
            {/if}
            {#if input.ctrlKey}
                <div class="key">Ctrl</div>
            {/if}
            {#if input.shiftKey}
                <div class="key">Shift</div>
            {/if}
            {#if input.altKey}
                <div class="key">Alt</div>
            {/if}
            {#if input.key}
                <div class="key">{input.key}</div>
            {/if}
        </div>

        <div class="icon">
            <Icon icon="material-symbols:keyboard" height="24" />
        </div>
    </button>
</div>

<style lang="scss">
button {
    background-color: transparent;
    border: none;
    outline: none;
    color: inherit;
    width: fit-content;
    height: fit-content;
    padding: 0;
    border-radius: 0;
    font-weight: inherit;

    background-color: var(--main-800);
    transition: all 0.3s;
    border-radius: 0.5rem;
    display: flex;
    padding: 0.5rem;
    width: 100%;
    &:hover {
        box-shadow: none;
    }
    &:focus {
        background-color: var(--main-700);
    }
    &:focus-visible {
        outline: none !important;
    }
    .keys {
        display: flex;
        gap: 0.5rem;
        .key {
            min-width: 40px;
            height: 40px;
            padding-inline: 0.5rem;
            @include flex-center;
            background-color: var(--main-900);
            border-radius: 0.25rem;
            font-size: 0.875rem;
            text-transform: capitalize;
        }
    }
    .placeholder {
        padding-inline: 0.5rem;
        font-size: 0.875rem;
    }
    .icon {
        pointer-events: none;
        margin-left: auto;
        background-color: var(--main-900);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        padding: 8px 16px;
    }
}
</style>
