<script context="module">
import { writable } from "svelte/store";
export const module = writable({});
export function restartModule() {
    module.set({});
}
</script>

<script>
import Icon from "@iconify/svelte";
import csv from "$lib/others/unicode.csv?raw";
import Select from "$comp/Select.svelte";
import { isEditMode, config } from "$routes/app.store";
import { notify } from "$comp/Notify/notify.store";
import { saveConfig, timeout } from "$fn/helper";

let codes = setCodes();

$: $module, onModuleChange();

function onModuleChange() {
    codes = setCodes();
}

let draggingThis, newSymbol, addToCategory, isDragging;
let ipc = window.ipc;

function setCodes() {
    if ($config.unicode?.data) {
        return $config.unicode.data;
    }

    return convertCSVtoJSON(csv);
}

function convertCSVtoJSON(csv) {
    if (csv.charCodeAt(0) === 0xfeff) {
        csv = csv.slice(1);
    }

    const arr = csv.split(/\n/);
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
        if (i === 0 && arr[i].startsWith("\uFEFF")) {
            // Skip the line with BOM
            continue;
        }
        const [type, symbol, description] = arr[i].replace("\r", "").split(",");

        if (!type) continue;

        if (!obj[type]) {
            obj[type] = [];
        }

        obj[type].push({ id: i, symbol, description });
    }

    return obj;
}

let category = Object.entries(codes).map(([k, v]) => {
    return k;
});

function onDragStart(e, data, category) {
    isDragging = true;
    const xferData = {
        data: data,
        from: category,
    };
    draggingThis = e.target;
    e.dataTransfer.setData("text/plain", JSON.stringify(xferData));
}

function onDrop(e, category) {
    const toIndex = (() => {
        const children = e.target.parentElement.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i] == e.target) {
                return i;
            }
        }
    })();

    const dataXfer = JSON.parse(e.dataTransfer.getData("text/plain"));

    // console.log("from", dataXfer.from);
    // console.log("to", category);

    if (dataXfer.from == category) {
        const currentIndex = codes[category].findIndex((x) => x.id == dataXfer.data.id);
        console.log(currentIndex);
        codes[category].splice(currentIndex, 1);
        codes[category].splice(toIndex, 0, dataXfer.data);
        codes = codes;
    } else {
        codes[dataXfer.from] = codes[dataXfer.from].filter((x) => x.id !== dataXfer.data.id);
        codes[category].splice(toIndex, 0, dataXfer.data);
    }

    save();
}

function dragOverItem(e, item) {
    if (e.target !== draggingThis) {
        e.target.classList.add("showIndicator");
    }
    item = item;
}

function add() {
    const category = addToCategory.getValue();
    let nextId = 0;
    for (const [cat, arr] of Object.entries(codes)) {
        nextId += arr.length;
    }
    codes[category].push({ id: nextId, symbol: newSymbol, description: "" });
    codes = codes;
    console.log(codes);
    newSymbol = "";
    save();
}

function save() {
    $config.unicode.data = codes;
    saveConfig();
}
</script>

{#if $isEditMode}
    <div class="unicodeList-container">
        <div class="unicodeList edit">
            {#each Object.entries(codes) as [category, items]}
                <div class="category">
                    <span>{category}</span>
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="category-container"
                        on:dragenter={(e) => {
                            e.preventDefault();
                        }}
                        on:dragover={(e) => {
                            e.preventDefault();
                        }}>
                        {#each items as item (item.id)}
                            <button
                                draggable="true"
                                class="draggable none card"
                                class:showIndicator={item.true}
                                on:dragstart={(e) => {
                                    onDragStart(e, item, category);
                                }}
                                on:dragend={(e) => {
                                    isDragging = false;
                                }}
                                on:drop={(e) => {
                                    onDrop(e, category);
                                }}
                                on:dragenter={(e) => {
                                    e.preventDefault();
                                }}
                                on:dragleave={(e) => {
                                    e.target.classList.remove("showIndicator");
                                }}
                                on:dragover={(e) => {
                                    dragOverItem(e, item);
                                    e.preventDefault();
                                }}>
                                <div class="symbol">
                                    {item.symbol}
                                </div>
                            </button>
                        {/each}
                        <div
                            class="emptySpace"
                            on:dragover={(e) => {
                                e.target.style.opacity = 1;
                            }}
                            on:dragleave={(e) => {
                                e.target.style.opacity = 0;
                            }}
                            on:drop={(e) => {
                                e.target.style.opacity = 0;

                                e.preventDefault();
                                const dataXfer = JSON.parse(e.dataTransfer.getData("text/plain"));

                                codes[dataXfer.from] = codes[dataXfer.from].filter(
                                    (x) => x.id !== dataXfer.data.id
                                );
                                codes[category].push(dataXfer.data);
                                codes = codes;
                                save();
                            }} />
                    </div>
                </div>
            {/each}
        </div>
        {#if !isDragging}
            <div class="add">
                <input bind:value={newSymbol} placeholder="Symbol" />
                <Select items={category} bind:this={addToCategory} />
                <button on:click={add}>Add</button>
            </div>
        {:else}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="delete"
                class:mouseover={null}
                on:drop={(e) => {
                    e.preventDefault();
                    isDragging = false;
                    const dataXfer = JSON.parse(e.dataTransfer.getData("text/plain"));
                    codes[dataXfer.from] = codes[dataXfer.from].filter(
                        (x) => x.id !== dataXfer.data.id
                    );
                    codes = codes;
                    save();
                }}
                on:dragover={(e) => {
                    e.preventDefault();
                    e.target.classList.add("mouseover");
                }}
                on:dragleave={(e) => {
                    e.preventDefault();
                    e.target.classList.remove("mouseover");
                }}>
                <Icon icon="mingcute:delete-2-line" height="24" />
                Delete
            </div>
        {/if}
    </div>
{:else}
    <div class="unicodeGrid">
        {#each Object.entries(codes) as [category, items]}
            <div class="category">
                <span>{category}</span>
                <div class="grid">
                    {#each items as item (item.id)}
                        <button
                            class="none card"
                            on:click={async () => {
                                navigator.clipboard.writeText(item.symbol);
                                await timeout(100);
                                notify.add("Copied to clipboard");
                                if ($config.unicode.config.hideOverlayOnCopy) {
                                    ipc.send("hide");
                                }
                            }}>
                            <div class="symbol">
                                {item.symbol}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
{/if}

<style lang="scss">
.draggable {
    position: relative;
    &.showIndicator {
        z-index: 100;
        &:after {
            content: "";
            position: absolute;
            left: -6px;
            height: 60%;
            width: 8px;
            border-block: 2px solid var(--accent);
        }
        &:before {
            content: "";
            position: absolute;
            left: -3px;
            height: 60%;
            border-right: 2px solid var(--accent);
        }
    }
}

.unicodeList-container {
    width: 100%;
    background-color: $bg-p;

    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    .unicodeList {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-right: 0.5rem;
        overflow-y: auto;
        .category {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            .category-container {
                display: flex;
                width: 100%;
                flex-wrap: wrap;
                gap: 0.325rem;
                padding-left: 0.325rem;
                button.card {
                    border-radius: 0.25rem;
                    // width: 100%;
                    height: 42px;
                    aspect-ratio: 1;
                    background-color: $bg-s;
                    @include flex-center;

                    .symbol {
                        pointer-events: none;
                        @include flex-center;
                    }
                    &:hover {
                        background-color: var(--main-800);
                    }
                }

                .emptySpace {
                    opacity: 0;
                    border: 1px dashed orange;
                    border-radius: 0.25rem;
                    height: 42px;
                    width: 42px;
                    margin-right: 0.25rem;
                    flex-grow: 1;
                }
            }
        }
    }
}

.unicodeGrid {
    display: grid;
    gap: 1rem;
    .category {
        background-color: $bg-p;
        padding: 1rem;
        border-radius: 0.5rem;
        display: grid;
        gap: 1rem;
        .grid {
            display: grid;
            gap: 0.325rem;
            grid-template-columns: repeat(8, 1fr);
            button.card {
                border-radius: 0.25rem;
                background-color: $bg-s;
                width: 100%;
                aspect-ratio: 1;
                &:hover {
                    color: #fff;
                    outline: 2px solid var(--accent);
                }
            }
        }
    }
}

.add {
    display: grid;
    width: 100%;
    gap: 0.5rem;
    grid-template-columns: auto 1fr auto;
    input {
        min-width: 0;
        width: 70px;
        text-align: center;
        border-radius: 0.5rem;
    }
    button {
        width: auto;
    }
}
.delete {
    // height: 46px;
    width: 100%;
    border: 1px dashed $warning;
    border-radius: 0.5rem;
    height: 46px;
    @include flex-center;
    color: $warning;
    gap: 0.5rem;
    & :global(svg) {
        pointer-events: none;
    }
    &.mouseover {
        background-color: rgba($warning, 0.125) !important;
    }
}
</style>
