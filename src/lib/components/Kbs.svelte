<script>
import Icon from '@iconify/svelte';
import { isEditMode, config } from '$routes/app.store';
import KbsEditor from './Kbs_editor.svelte';
import { saveConfig } from '$fn/helper';

let newEditor;
let entry = {
    value: '',
    description: '',
    keys: '',
};

function copy(value) {
    navigator.clipboard.writeText(value);
}

function showNewEditor() {
    newEditor = true;
}

function addNewEntry(data) {
    if (!$config.kbs) {
        $config.kbs = [];
    }
    $config.kbs.push(data);
    $config.kbs = $config.kbs;
    resetEntry();
    newEditor = false;
    saveConfig();
}

function updateEntry(data, index) {
    $config.kbs[index] = data;
    $config.kbs[index].edit = false;
    $config.kbs = $config.kbs;
    resetEntry();

    saveConfig();
}

function removeEntry(index) {
    console.log(index);
    $config.kbs.splice(index, 1);
    $config.kbs = $config.kbs;
    saveConfig();
}

function resetEntry() {
    entry = {
        value: '',
        description: '',
        keys: '',
    };
}
</script>

<div class="container">
    {#if $config.kbs && $config.kbs.length}
        <div class="shortcut">
            {#each $config.kbs as row, index}
                <div class="row">
                    {#if row.edit}
                        <KbsEditor
                            data={row}
                            mode="edit"
                            on:remove={() => {
                                removeEntry(index);
                            }}
                            on:cancel={() => {
                                row.edit = false;
                            }}
                            on:save={(e) => {
                                updateEntry(e.detail, index);
                            }} />
                    {:else}
                        <div class="content" class:edit={$isEditMode}>
                            <button
                                class="none value"
                                on:click={() => {
                                    copy(row.value);
                                }}>
                                <span>{row.value}</span>
                            </button>
                            <div class="description">
                                {row.description}
                            </div>

                            <div class="keys">
                                {#each row.keys as key}
                                    <div class="key">
                                        <span>{key}</span>
                                    </div>
                                {/each}
                            </div>

                            {#if $isEditMode}
                                <button
                                    class="none icon grey edit"
                                    on:click={() => {
                                        row.edit = true;
                                    }}>
                                    <Icon icon="iconoir:edit-pencil" width="20" />
                                </button>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
    {#if $isEditMode}
        <div class="newEditor">
            {#if newEditor}
                <KbsEditor
                    on:cancel={() => {
                        newEditor = false;
                    }}
                    on:save={(e) => {
                        addNewEntry(e.detail);
                    }} />
            {:else}
                <button class="add fit" on:click={showNewEditor}> Add new shortcut </button>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
.container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    min-width: 0;
}

.shortcut {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    .row {
        width: 100%;
        .content {
            height: 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            // grid-template-columns:;
            &.edit {
                flex-wrap: nowrap;
            }
            button.value {
                width: 2rem;
                height: 2rem;
                border: 2px solid $grey;
                background-color: rgba($grey, 0.25);
                border-radius: 0.25rem;
                display: grid;
                justify-content: center;
                align-items: center;
                transition: all 0.3s;
                &:hover {
                    border-color: var(--accent);
                    background-color: var(--accent-800);
                }
            }
            .description {
                text-align: left;
                margin-right: auto;
            }
            .keys {
                display: flex;
                justify-content: flex-end;
                // background-color: red;
                gap: 0.25rem;
                .key {
                    width: 30px;
                    aspect-ratio: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    position: relative;
                    overflow: hidden;
                    color: #c5c5c5;
                    font-size: 0.875rem;
                    background-color: #353535;
                    border: 1px solid #222229;
                    box-shadow: 0 2px 2px rgba(26, 29, 33, 0.15), inset 0 1px 0 0 #4f4c4c;
                    span {
                        z-index: 1;
                    }
                    &:before {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        // content: '';
                        background-color: $accent;
                    }
                }
            }
            button.edit {
                margin-left: -0.5rem;
            }
        }

        &:not(:last-child) {
            padding-bottom: 1rem;
            border-bottom: 1px solid $grey;
        }
    }
}

.newEditor {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
