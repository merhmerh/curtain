<script context="module">
export function initItems(arr) {
    const items = [];
    arr.forEach((item) => {
        if (typeof item !== "object") {
            return items.push({
                value: item,
                label: item,
            });
        }
        item.match = true;
        items.push(item);
    });
    return items;
}
</script>

<script>
import { createEventDispatcher, onMount, tick } from "svelte";
import Icon from "@iconify/svelte";
let open = false;
export let firstItem = 0;
export let items;
export let size = "";
export let border = false;
export let searchable = false;
export let maxHeight = 220;
export let placeholder = "";
let foundSearch = true;
let input;
export let error = "";
const dispatch = createEventDispatcher();

const arrItems = (() => {
    if (!items) {
        return [];
    }

    const arr = [];
    items.forEach((item) => {
        if (typeof item !== "object") {
            return arr.push({
                value: item,
                label: item,
                match: true,
            });
        }
        item.match = true;
        arr.push(item);
    });
    return arr;
})();

export let selected = placeholder ? null : arrItems[firstItem];
function clickOutside(element, callback) {
    document.body.addEventListener("click", onClick);

    function onClick(event) {
        if (!element.contains(event.target) && open) {
            open = false;
        }
    }
}

export function change(item) {
    error = false;
    // placeholder = null;
    selected = { ...item };
    open = false;
    dispatch("change", selected);
}

async function toggleDropdown() {
    open = !open;
    if (open && searchable) {
        await tick();
        input.focus();
    }
}

function filter(string) {
    if (!string.length) {
        return resetFilter();
    }

    resetFilter();
    let matches = 0;
    arrItems.forEach((item, index) => {
        const label = item.label.toString();
        const match = label.match(new RegExp(string, "i"));
        if (!match) {
            return (arrItems[index].match = false);
        }
        matches++;
    });

    if (!matches) {
        foundSearch = false;
    }

    function resetFilter() {
        foundSearch = true;
        arrItems.forEach((item, index) => {
            arrItems[index].match = true;
        });
    }
}

export function getSelected() {
    return selected;
}
export function getValue() {
    if (!selected) {
        return null;
    }
    return selected.value;
}

export function setError() {
    error = true;
}

export function reset() {
    selected = null;
}
</script>

{#if items}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="select_container"
        use:clickOutside
        class:small={size == "small"}
        class:smaller={size == "smaller"}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="select"
            class:error
            class:placeholder={selected == null}
            class:focus={open == true}
            data-value={selected ? selected.value : ""}
            on:click={toggleDropdown}>
            {#if selected == null}
                {placeholder}
            {:else}
                {selected.label}
            {/if}
            <div class="expand">
                <Icon icon="ic:outline-expand-more" width="20" inline={true} />
            </div>
        </div>

        {#if open}
            <div class="dropdown" style="max-height:{maxHeight}px">
                {#if searchable}
                    <input
                        bind:this={input}
                        on:input={() => {
                            filter(input.value);
                        }}
                        spellcheck="false"
                        autocomplete="false"
                        placeholder="Search..." />
                {/if}
                <div class="items_container">
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    {#each arrItems as item}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div
                            class="item"
                            class:border
                            class:hide={!item.match && input && input.value.length}
                            class:selected={selected ? selected.value == item.value : false}
                            on:click={() => {
                                change(item);
                            }}>
                            {item.label}
                        </div>
                    {/each}
                    {#if searchable && !foundSearch}
                        <div class="no_options_found">No options found</div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
{/if}

<style lang="scss">
.select_container {
    height: 100%;
    height: fit-content;
    position: relative;
}
.select {
    background-color: $bg-p;
    min-width: 200px;
    border: 1px solid var(--main-900);
    padding: 0.75rem;
    border-radius: 0.5rem;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    &.placeholder {
        color: var(--main-700);
    }
    &.focus {
        border-color: var(--accent-500);
    }

    .expand {
        @include flex-center;
        margin-left: auto;
        color: var(--main-600);
    }

    &.error {
        border-color: $red;
    }
}

.dropdown {
    position: absolute;
    right: 0;
    margin-top: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--main-800);
    width: 100%;
    background-color: $bg-p;
    display: flex;
    flex-direction: column;
    z-index: 200;
    max-height: 220px;
    overflow: hidden;

    input {
        border: none;
        border-radius: 0;
        border-bottom: 1px solid var(--main-900);
        font-style: inherit;
        padding-block: 0.75rem;
        &:focus {
            outline: none;
            background-color: inherit;
        }
        &::placeholder {
            font-style: italic;
        }
    }

    .items_container {
        height: auto;
        overflow-y: auto;
        .item {
            padding: 0.5rem;
            cursor: pointer;
            &:hover {
                background-color: var(--main-900);
            }

            &.hide {
                display: none;
            }

            &.selected {
                background-color: var(--accent-600);
                color: var(--main-100);
            }
            &.border {
                border-bottom: 1px solid var(--main-900);
            }
        }

        .no_options_found {
            padding: 0.5rem;
            color: $main-light;
            text-align: center;
        }
    }
}

.small {
    .select {
        border-radius: 0.325rem 0.325rem;
        padding-block: 0.5rem;
    }
    .dropdown {
        border-radius: 0.325rem;
    }
    .items_container {
        .item {
            padding-block: 0.325rem;
        }
    }
}

.smaller {
    .select {
        border-radius: 0.25rem 0.25rem;
        padding-block: 0.325rem;
    }
    .dropdown {
        border-radius: 0.25rem;
    }
    .items_container {
        .item {
            padding-block: 0.325rem;
        }
    }
}
</style>
