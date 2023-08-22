<script>
import Icon from "@iconify/svelte";
import { createEventDispatcher, onMount } from "svelte";

const dispatch = createEventDispatcher();

let container;
export let data = {
    value: "",
    description: "",
    keys: "",
};
export let mode = "add";

function save() {
    let error = 0;

    if (!data.value || !data.description) {
        return console.log("value and description cannot be empty");
    }

    if (!Array.isArray(data.keys)) {
        if (!data.keys) {
            data.keys = [];
        } else {
            data.keys = data.keys.split(",");
        }
    }
    console.log(data);

    dispatch("save", data);
}

function cancel() {
    dispatch("cancel");
}

function remove() {
    dispatch("remove");
}

onMount(() => {
    container.firstElementChild.select();
});
</script>

<div class="newEditor" bind:this={container}>
    <input type="text" bind:value={data.value} maxlength="1" placeholder="♣" />
    <input type="text" bind:value={data.description} placeholder="description" />
    <input type="text" bind:value={data.keys} placeholder="ctrl,alt,del" />
    <div class="actions" class:flip={mode == "edit"}>
        <button class="icon" on:click={save}>
            {#if mode == "edit"}
                <Icon icon="mingcute:check-line" height="16" />
            {:else}
                <Icon icon="fluent:add-12-filled" height="16" />
            {/if}
        </button>

        {#if mode == "add"}
            <button class="icon alt" on:click={cancel}>
                <Icon icon="mingcute:close-fill" height="16" />
            </button>
        {:else}
            <button class="icon warning" on:click={remove}>
                <Icon icon="mingcute:delete-2-line" height="16" />
            </button>
        {/if}
    </div>
</div>

<style lang="scss">
.newEditor {
    height: 36px;
    display: grid;
    gap: 0.25rem;
    grid-template-columns: 36px auto auto auto;
    input:first-child {
        text-align: center;
    }
    input {
        min-width: 0;
        font-size: 0.875rem;
    }
    .actions {
        height: 100%;
        display: flex;
        gap: 0.25rem;
        &.flip {
            flex-direction: row-reverse;
        }
        button {
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            .icon {
                color: var(--accent-500);
                @include flex-center;
            }
        }
    }
}
</style>
