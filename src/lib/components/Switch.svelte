<script>
export let isChecked = false;
import Icon from '@iconify/svelte';
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

function toggleCheck() {
    isChecked = !isChecked;
    dispatch('change', isChecked);
}
</script>

<button on:click={toggleCheck} class:checked={isChecked}>
    <div class="ball">
        {#if !isChecked}
            <Icon icon="mingcute:close-fill" width="12" />
        {:else}
            <Icon icon="mingcute:check-fill" width="12" />
        {/if}
    </div>
</button>

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
    &:hover,
    &:focus {
        box-shadow: none;
    }
    width: 2.5rem;
    height: 1.5rem;
    background-color: var(--main-600);
    border-radius: 1rem;
    padding-inline: 0.25rem;
    justify-content: flex-start;
    transition: all 0.3s ease;

    .ball {
        left: 0;
        width: 18px;
        height: 18px;
        border-radius: 100%;
        background-color: var(--main-100);
        color: var(--main-600);
        transition: all 0.3s ease;
        @include flex-center;
    }
    &.checked {
        background-color: $green;

        .ball {
            transform: translateX(14px);
            color: $green;
        }
    }
}
</style>
