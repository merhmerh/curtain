<script>
export let notification;
export let opts;
import Icon from "@iconify/svelte";
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();

function remove() {
    dispatch("remove");
}
</script>

<div class="card">
    <div class="icon">
        {#if !opts.type || opts.type == "info"}
            <Icon icon="fluent:info-12-regular" height="24" />
        {/if}
        {#if opts.type == "copy"}
            <Icon icon="mingcute:copy-3-line" height="24" />
        {/if}
    </div>
    <span class:alignCenter={opts.align == "center"}>
        {notification}
    </span>
    <button class="none close" on:click={remove}>
        <Icon icon="mingcute:close-line" width="20" />
    </button>
</div>

<style lang="scss">
.card {
    width: 350px;
    background-color: $bg-s;
    padding: 0.5rem;
    padding-inline: 1rem 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.5s ease-in-out;
    opacity: 1;
    display: flex;
    align-items: center;
    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 20px;
    }
    span {
        padding: 0.5rem;
        width: 100%;
        &.alignCenter {
            text-align: center;
        }
    }
    .close {
        width: 36px;
        aspect-ratio: 1;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-left: 0.25rem;
        border-left: 1px solid var(--main-800);
        &:hover {
            color: var(--accent-500);
        }
    }
}
</style>
