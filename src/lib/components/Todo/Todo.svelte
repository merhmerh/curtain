<script>
import Icon from "@iconify/svelte";
import { isEditMode, config } from "$routes/app.store";
import { saveConfig, setNestedProperty } from "$fn/helper";

if ($config.todos?.config?.clearRecycleBinOnRestart) {
    delete $config.todos?.recycleBin;
    saveConfig();
}

let newTaskString;
let recycleBinOpen = true,
    recycleBin = $config.todos?.recycleBin || [];

function addEntry() {
    if (!newTaskString) return;
    if (!$config.todos?.data) {
        setNestedProperty($config, "todos.data", []);
        // $config.todos.data = {
        // data: [],
        // };
    }
    $config.todos.data.push({ task: newTaskString, done: false });
    $config = $config;
    newTaskString = "";
    save();
}

function removeEntry(index) {
    const row = $config.todos.data[index];
    recycleBin = [row, ...recycleBin];
    $config.todos.data.splice(index, 1);
    $config.todos.data = $config.todos.data;

    save();
}

function updateEntry(index) {
    $config.todos.data[index].done = !$config.todos.data[index].done;
    $config.todos.data = $config.todos.data;

    save();
}

function save() {
    $config.todos.data.map((x) => {
        console.log(x);
        delete x.edit;
    });

    $config.todos.recycleBin = recycleBin;

    saveConfig();
}

function recycle(index) {
    const row = recycleBin[index];
    $config.todos.data.push(row);
    $config = $config;

    removeFromRecycleBin(index);
    save();
}

function removeFromRecycleBin(index) {
    recycleBin.splice(index, 1);
    recycleBin = recycleBin;
}
</script>

<div class="container">
    <div class="inputBox">
        <input
            type="text"
            bind:value={newTaskString}
            placeholder="Enter new task"
            on:keydown={(e) => {
                if (e.key == "Enter") {
                    addEntry();
                }
            }} />
        <div class="button">
            <button
                class="alt"
                on:click={(e) => {
                    addEntry();
                    console.log(e.target.blur());
                }}>+</button>
        </div>
    </div>

    <div class="tasks" class:shrink={$isEditMode}>
        {#if $config.todos?.data}
            {#each $config.todos.data as todo, index}
                <div class="task-container">
                    {#if !todo.edit}
                        <button
                            class="task none"
                            class:done={todo.done}
                            on:click={() => {
                                updateEntry(index);
                            }}>
                            <div class="none check">
                                {#if todo.done}
                                    <Icon icon="ph:circle-duotone" width="16" />
                                {:else}
                                    <Icon icon="ic:outline-circle" width="16" />
                                {/if}
                            </div>
                            <span>{todo.task}</span>
                        </button>
                    {:else}
                        <input
                            type="text"
                            bind:value={todo.task}
                            on:keydown={(e) => {
                                if (e.key == "Enter") {
                                    save();
                                    todo.edit = false;
                                }
                            }} />
                    {/if}

                    <div class="actions" class:show={todo.edit}>
                        {#if todo.edit}
                            <button
                                class="icon save"
                                on:click={() => {
                                    todo.edit = false;
                                    save();
                                }}>
                                <Icon icon="mingcute:check-line" height="16" />
                            </button>
                        {:else}
                            <button
                                class="none"
                                on:click={() => {
                                    removeEntry(index);
                                }}>
                                <Icon icon="mingcute:delete-2-line" height="20" />
                            </button>
                            <button
                                class="none icon"
                                on:click={() => {
                                    todo.edit = true;
                                }}>
                                <Icon icon="iconoir:edit-pencil" width="20" />
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        {/if}
    </div>

    {#if $isEditMode && recycleBin.length > 0}
        <div class="recycleBin">
            <div class="title">
                <Icon icon="fluent:bin-recycle-20-filled" height="32" />
                <span>Recycle Bin</span>
                <button
                    class="none"
                    class:flip={recycleBinOpen}
                    on:click={() => {
                        recycleBinOpen = !recycleBinOpen;
                    }}>
                    <Icon icon="material-symbols:expand-more-rounded" height="32" />
                </button>
            </div>
            {#if recycleBin.length && recycleBinOpen}
                <ul class="oldTasks">
                    {#each recycleBin as item, index}
                        <li>
                            <div class="task">
                                <span>{item.task}</span>
                                <div class="actions">
                                    <button
                                        class="none"
                                        on:click={() => {
                                            recycle(index);
                                        }}>
                                        <Icon icon="mdi:recycle" height="20" />
                                    </button>

                                    <button
                                        class="none"
                                        on:click={() => {
                                            removeFromRecycleBin(index);
                                        }}>
                                        <Icon icon="mingcute:delete-2-line" height="20" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
.container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
    overflow-y: auto;
}

.inputBox {
    .button {
        padding-right: 4px;
        button {
            height: 28px;
            width: 28px;
            padding: 0.2rem;
            border-radius: 0.25rem;
            &:focus {
                box-shadow: none;
            }
        }
    }
}

.tasks {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    max-height: calc(100vh - 5rem - 164px);
    &.shrink {
        max-height: calc(100vh - 600px);
    }
    .task-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        justify-content: space-between;
        &:hover {
            .actions {
                opacity: 1;
            }
        }
        input {
            width: 100%;
        }

        button.task {
            gap: 0.5rem;
            padding-block: 0;
            justify-content: flex-start;
            width: calc(100% - 80px);

            &.done {
                .check {
                    color: var(--accent-500);
                }
                span {
                    text-decoration: line-through;
                    color: $main-light;
                }
            }
            .check {
                @include flex-center;
                justify-content: flex-start;
                color: $grey-lighter;
                height: 36px;
                width: 24px;
                flex-shrink: 0;
            }
            span {
                white-space: pre-wrap;
                word-wrap: break-word;
                text-align: left;
                width: auto;
                display: inline-block;
                width: calc(100% - 24px);
            }
        }

        .actions {
            width: 56px;
            opacity: 0;
            display: flex;
            gap: 0.5rem;
            &.show {
                opacity: 1;
            }
            button {
                color: $main-light;
            }
            button.save {
                color: $main;
                height: 36px;
                width: 36px;
            }
        }
    }
}

.recycleBin {
    margin-top: 1rem;
    background-color: $bg-s;
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: $main-light;
    display: grid;
    gap: 0.75rem;
    .title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: $main-light;
        button {
            margin-left: auto;
            &.flip {
                transform: rotateZ(180deg);
            }
        }
    }
    ul.oldTasks {
        border-radius: 0.25rem;
        background-color: $bg-p;
        display: flex;
        flex-direction: column;
        // gap: 0.5rem;
        margin: 0;
        padding-left: 2rem;
        max-height: 200px;
        overflow-y: auto;
        scrollbar-gutter: stable;

        .task {
            display: flex;
            margin: 0;
            list-style-type: disc;
            justify-content: space-between;
            align-items: center;
            padding-inline: 0.5rem;
            padding-block: 0.5rem;
            span {
                white-space: pre-wrap;
                word-wrap: break-word;
                text-align: left;
                width: auto;
                display: inline-block;
                width: calc(100% - 24px);
            }
            .actions {
                display: flex;
                width: 60px;
                gap: 1rem;
                justify-content: flex-end;
                flex-direction: row-reverse;
            }
        }
    }
}
</style>
