<script>
import { createEventDispatcher, onDestroy, onMount } from 'svelte';
import Icon from '@iconify/svelte';
import { fly } from 'svelte/transition';
let modal;
export let closePosition = 'relative';
export let transition = true;
export let modalPosition = 'center';
export let closeButton = true;
export let escape = true;
export let exitOutside = true;
const dispatch = createEventDispatcher();

let transitionDuration = transition ? 300 : transition;

export function close() {
    dispatch('close');
}

function clickOutside() {
    if (!exitOutside) {
        return;
    }
    close();
}

onMount(() => {
    document.body.style.overflowY = 'hidden';
});

onDestroy(() => {
    document.body.style.overflowY = 'auto';
});

const handle_keydown = (e) => {
    if (!escape) {
        return;
    }
    if (e.key === 'Escape') {
        close();
        return;
    }

    if (e.key === 'Tab') {
        // trap focus
        const nodes = modal.querySelectorAll('*');
        const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);

        let index = tabbable.indexOf(document.activeElement);
        if (index === -1 && e.shiftKey) index = 0;

        index += tabbable.length + (e.shiftKey ? -1 : 1);
        index %= tabbable.length;

        tabbable[index].focus();
        e.preventDefault();
    }
};

function closeFromChild() {
    close();
}
</script>

<svelte:window on:keydown={handle_keydown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="modal-background"
    transition:fly={{ duration: transitionDuration }}
    on:click|self={clickOutside}
    bind:this={modal}>
    {#if closeButton}
        {#if closePosition == 'absolute'}.
            <button class="modal_close plain topright" on:click={close}>
                <Icon icon="material-symbols:close" width="42" inline={true} />
            </button>
        {/if}
    {/if}
    <div class="modal" modal_position={modalPosition} role="dialog" aria-modal="true">
        {#if closeButton}
            {#if closePosition == 'relative'}
                <button class="modal_close plain" on:click={close}>
                    <Icon icon="material-symbols:close" width="24" inline={true} />
                </button>
            {/if}
        {/if}
        <slot {closeFromChild} />
    </div>
</div>

<style lang="scss">
.modal_close {
    position: absolute;
    top: 0rem;
    right: 0rem;
    cursor: pointer;
    // display: flex;
    display: flex;
    height: 36px;
    width: 36px;
    margin: 0.5rem;
    padding: 0.5rem;
    border-radius: 50px;
    :global(svg) {
        flex-shrink: 0;
    }
    &:hover {
        background-color: $grey-lighter;
    }
    &.topright {
        margin: 1.5rem;
        width: 60px;
        height: 60px;
        &:hover {
            background-color: $grey-lighter !important;
        }
    }
}
.modal-background {
    @include bg-blur;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.modal {
    z-index: 101;
    position: absolute;
    overflow: auto;
    max-height: calc(100vh - 4em);
    width: fit-content;
    max-width: 80vw;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 1rem;
    @media screen and (max-width: $mobile) {
        max-width: calc(100vw - 3rem);
    }

    &[modal_position='top'] {
        top: 5rem;
    }
}
</style>
