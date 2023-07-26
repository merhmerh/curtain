<script>
import Select from './Select.svelte';
import { isEditMode, config } from '$routes/app.store';
import { saveConfig } from '$fn/helper';

export let index;

const options = [
    { value: 'kbs', label: 'Keyboard Shortcuts' },
    { value: 'note', label: 'Note' },
    { value: 'todo', label: 'To-do List' },
    { value: 'shortcut', label: 'Shortcut' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'none', label: 'None' },
];

function getFirstItem() {
    for (const [i, r] of options.entries()) {
        if ($config.modules[index] == r.value) {
            return i;
        }
    }
}

function changeModule(e) {
    const selection = e.detail;
    $config.modules[index] = selection.value;
    saveConfig();
}
</script>

<div class="container">
    {#if $isEditMode}
        <div class="select">
            <Select items={options} firstItem={getFirstItem()} on:change={changeModule} />
        </div>
    {/if}
    <slot />
</div>

<style lang="scss">
.container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
}
</style>
