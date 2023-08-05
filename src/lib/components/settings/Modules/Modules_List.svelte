<script>
import Icon from "@iconify/svelte";
import { fly } from "svelte/transition";

let expanded;
</script>

<div class="container" class:expanded>
    <button
        class="none"
        on:click={() => {
            expanded = !expanded;
        }}>
        <div class="icon">
            <Icon icon="iconoir:component" height="24" />
        </div>
        <span>Modules</span>
        <div class="icon" class:expanded>
            <Icon icon="ic:round-expand-more" height="24" />
        </div>
    </button>

    {#if expanded}
        <div class="list" transition:fly>
            <slot />
        </div>
    {/if}
</div>

<style lang="scss">
div.container {
    width: 100%;
    border-radius: 0.5rem;
}
button {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    justify-content: flex-start;
    border-radius: 0.5rem;
    padding-block: 0.5rem;
    padding-inline: 0.5rem;

    &:hover {
        background-color: var(--main-900);
    }
    &:focus-visible {
        outline: 1px solid var(--accent-400) !important;
    }

    .icon {
        @include flex-center;
        &:last-child {
            margin-left: auto;
            transition: all 0.15s;
            transform: rotateZ(-90deg);
            &.expanded {
                transform: rotateZ(0deg);
            }
        }
    }
}
.list {
    width: 100%;
    margin-top: 0.25rem;
    padding-left: 0.75rem;
    padding-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>
