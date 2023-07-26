<script>
import { createEventDispatcher } from 'svelte';
import Icon from '@iconify/svelte';
import { isURL } from '$fn/helper';

const dispatch = createEventDispatcher();
const ipc = window.ipc;

export let data = { filePath: '', name: '', icon: '', type: 'folder' };
export let mode = 'add';

export let types = [
    { type: 'pdf', ext: 'pdf' },
    { type: 'xls', ext: 'csv,xls,xlsx' },
    { type: 'ppt', ext: 'ppt,pptx' },
    { type: 'txt', ext: 'text,txt' },
    { type: 'app', ext: 'exe' },
];

function save() {
    if (!data.filePath || !data.name) {
        return;
    }
    if (isURL(data.filePath)) {
        data.type = 'url';
    }
    //get ext
    const ext = data.filePath.replace(/"/g, '').split('.').pop();
    for (const t of types) {
        const array = t.ext.split(',');
        if (array.includes(ext)) {
            data.type = t.type;
            break;
        }
    }

    dispatch('save', data);
}
function remove() {
    dispatch('remove');
}
function cancel() {
    dispatch('cancel');
}

function drop(e) {
    const file = e.dataTransfer.files[0];
    console.log(file.path);
    data.filePath = file.path;
    data.name = file.name;
}
</script>

<div class="edit">
    <input on:drop={drop} type="text" bind:value={data.filePath} placeholder="file path" />
    <input on:drop={drop} type="text" bind:value={data.name} placeholder="Name" />
    <div class="actions">
        <button class="icon" on:click={save}>
            <Icon icon="mingcute:check-line" height="16" />
        </button>
        {#if mode == 'save'}
            <button class="icon warning" on:click={remove}>
                <Icon icon="mingcute:delete-2-line" height="16" />
            </button>
        {:else}
            <button class="icon" on:click={cancel}>
                <Icon icon="mingcute:close-fill" height="16" />
            </button>
        {/if}
    </div>
</div>

<style lang="scss">
.edit {
    display: flex;
    width: 100%;
    // grid-template-columns: auto auto auto;
    align-items: center;
    gap: 0.5rem;

    input {
        min-width: 0;
    }
    .actions {
        display: flex;
        gap: 0.5rem;
        flex-direction: row-reverse;
        button.icon {
            width: 2rem;
            height: 2rem;
        }
    }
}
</style>
