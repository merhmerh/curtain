<script>
import NoteEditor from './Note_editor.svelte';
import { isEditMode, config, blockGlobalShortcut } from '$routes/app.store';
import Icon from '@iconify/svelte';
const ipc = window.ipc;
let openEditor = false;
let noteIndex;

function openCard(index) {
    if (openEditor) return;
    noteIndex = index;
    openEditor = true;
}

function newNote() {
    $isEditMode = false;
    noteIndex = null;
    openEditor = true;
}
</script>

{#if openEditor}
    <NoteEditor
        index={noteIndex}
        on:open={() => {
            console.log('open');
            $blockGlobalShortcut = true;
        }}
        on:save={() => {
            // $config.note = $config.note;
        }}
        on:close={() => {
            $blockGlobalShortcut = false;
            openEditor = false;
        }} />
{/if}

<div class="container">
    {#if $isEditMode}
        <button class="newNote" on:click={() => newNote()}>
            <Icon icon="iconamoon:edit" width="20" />
            New Note
        </button>
    {/if}
    {#if $config.note}
        {#each $config.note as note, index}
            <button
                class="card none"
                on:click={() => {
                    openCard(index);
                }}>
                <div class="title">{note.title}</div>
                <div class="preview">
                    {note.content}
                </div>
            </button>
        {/each}
    {/if}
</div>

<style lang="scss">
.container {
    display: grid;
    gap: 1rem;

    .newNote {
        padding-block: 0.75rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .card {
        border-radius: 0.5rem;
        // background-color: $bg-p;
        background-color: $bg-s;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        max-height: 200px;
        overflow-y: auto;
        scrollbar-gutter: stable;
        gap: 0.5rem;
        align-items: flex-start;
        text-align: left;
        width: 100%;
        &:hover {
            .title {
                color: $accent;
            }
        }
        .title {
            font-weight: 600;
        }
        .preview {
            @include text-overflow-2;
            white-space: pre-line;
            font-size: 0.875rem;
            word-break: break-all;
            width: 100%;
        }
    }
}
</style>
