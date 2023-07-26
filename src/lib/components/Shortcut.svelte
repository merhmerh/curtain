<script>
import ShortcutEditor from './Shortcut_editor.svelte';
import { isEditMode, config } from '$routes/app.store';
import { saveConfig } from '$fn/helper';

import Icon from '@iconify/svelte';

const ipc = window.ipc;
let newEditor = false;

$: $isEditMode,
    (() => {
        newEditor = false;
        if (!$isEditMode && $config.shortcut) {
            $config.shortcut.map((x) => {
                delete x.edit;
            });
        }
    })();

function saveEntry(data) {
    if (!$config.shortcut) {
        $config.shortcut = [];
    }

    $config.shortcut.push(data);
    $config = $config;

    save();
}

function removeEntry(index) {
    $config.shortcut.splice(index, 1);
    $config = $config;
    save();
}

function updateEntry(data, index) {
    $config.shortcut[index] = data;
    $config = $config;
    save();
}

function save() {
    $config.shortcut.map((x) => {
        delete x.edit;
    });

    saveConfig();
}

function openFile(sc) {
    ipc.send('openPath', sc.filePath);
    ipc.send('hide');
}
</script>

<div class="container">
    {#if $config.shortcut && $config.shortcut.length}
        <div class="shortcuts">
            {#each $config.shortcut as sc, index}
                <button
                    class="row none"
                    class:disabled={$isEditMode}
                    on:click={() => {
                        if ($isEditMode) return;
                        openFile(sc);
                    }}>
                    {#if !sc.edit}
                        <div class="scIcon">
                            {#if sc.type == 'folder'}
                                <Icon icon="flat-color-icons:folder" width="48" />
                            {:else if sc.type == 'url'}
                                <Icon icon="flat-color-icons:globe" width="48" />
                            {:else if sc.type == 'ppt'}
                                <Icon icon="vscode-icons:file-type-powerpoint" width="48" />
                            {:else if sc.type == 'xls'}
                                <Icon icon="vscode-icons:file-type-excel" width="48" />
                            {:else if sc.type == 'pdf'}
                                <Icon icon="vscode-icons:file-type-pdf2" width="48" />
                            {:else if sc.type == 'txt'}
                                <Icon icon="flat-color-icons:document" width="48" />
                            {:else if sc.type == 'app'}
                                <Icon icon="cib:atom" width="42" />
                            {/if}
                        </div>
                        <span>{sc.name}</span>
                    {:else}
                        <ShortcutEditor
                            data={sc}
                            on:save={(e) => {
                                updateEntry(e.detail, index);
                                sc.edit = false;
                            }}
                            on:cancel={() => {
                                sc.edit = false;
                            }} />
                    {/if}
                    {#if $isEditMode && !sc.edit}
                        <div class="actions">
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
                                    sc.edit = true;
                                }}>
                                <Icon icon="iconoir:edit-pencil" width="20" />
                            </button>
                        </div>
                    {/if}
                </button>
            {/each}
        </div>
    {/if}

    {#if $isEditMode}
        <div class="newEditor">
            {#if newEditor}
                <ShortcutEditor
                    on:cancel={() => {
                        newEditor = false;
                    }}
                    on:save={(e) => {
                        saveEntry(e.detail);
                        newEditor = false;
                    }} />
            {:else}
                <button
                    class="fit"
                    on:click={() => {
                        newEditor = true;
                    }}>Add new shortcut</button>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
.container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    .newEditor {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
}

.shortcuts {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    button.row {
        height: 48px;
        align-items: center;
        display: flex;
        gap: 0.5rem;
        width: 100%;
        justify-content: flex-start;
        &.disabled {
            cursor: default;
            &:hover {
                span {
                    color: $main-light;
                }
            }
        }
        span {
            color: $main;
        }
        &:hover {
            span {
                color: var(--accent-500);
            }
        }
        .scIcon {
            width: 3rem;
            height: 3rem;
            color: $accent;
            @include flex-center;
        }
        .actions {
            margin-left: auto;
            display: flex;
            gap: 0.5rem;
            color: $main-light;
        }
    }
}
</style>
