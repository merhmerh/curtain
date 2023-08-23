<script>
import Icon from "@iconify/svelte";
import Converter from "$comp/Converter/Converter.svelte";
import Glossary from "$comp/Glossary/Glossary.svelte";
import Select, { initItems } from "$comp/Select.svelte";
import Alarm from "$comp/Utilities/Alarm.svelte";
import { isEditMode, config } from "$routes/app.store";
import { saveConfig } from "$fn/helper";
let options = initItems(["Converter", "Glossary", "Alarm"]);

export let id;
let moduleSelection;
let miniModules = init();

function init() {
    const thisModule = $config[id] ?? [];
    return thisModule;
}

function save() {
    console.log(miniModules);
    $config[id] = miniModules;
    saveConfig();
}
</script>

<div class="custom-wrapper" {id}>
    {#if $isEditMode}
        <div class="add">
            <Select items={options} bind:this={moduleSelection} placeholder="Select sub module" />
            <button
                on:click={() => {
                    const value = moduleSelection.getValue();
                    if (!value) {
                        return;
                    }
                    miniModules.unshift(value);
                    miniModules = miniModules;
                    save();
                    moduleSelection.reset();
                }}>Add</button>
        </div>
    {/if}
    {#each miniModules as mod, index}
        <div class="container" class:editMode={$isEditMode}>
            {#if $isEditMode}
                <div class="header">
                    <div class="name">
                        <span>Module</span>
                        <Select
                            size="small"
                            items={options}
                            selected={options.filter((x) => x.value == mod)[0]}
                            on:change={(e) => {
                                mod = e.detail.value;
                                save();
                            }} />
                    </div>
                    <button
                        class="delete none"
                        on:click={(e) => {
                            miniModules.splice(index, 1);
                            miniModules = miniModules;
                            save();
                        }}>
                        <Icon icon="mingcute:delete-2-line" height="20" />
                    </button>
                </div>
            {/if}

            <div class="module" class:disabled={$isEditMode}>
                {#if mod == "Converter"}
                    <Converter />
                {:else if mod == "Glossary"}
                    <Glossary />
                {:else if mod == "Alarm"}
                    <Alarm />
                {/if}
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
.custom-wrapper {
    display: grid;
    gap: 1rem;

    div.add {
        height: 100%;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.5rem;
        align-items: center;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background-color: rgba(#000, 0.25);
        @include bg_blur;
        border: 1px solid var(--main-900);
    }
}

.container {
    display: grid;
    gap: 0.5rem;
    &:not(:last-child) {
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--main-900);
        margin-bottom: 1rem;
    }
    &.editMode {
        border-radius: 0.5rem;
        padding: 0.5rem;
        background-color: rgba(#000, 0.25);
        @include bg_blur;
        border: 1px solid var(--main-900);
    }
    .header {
        display: flex;
        align-items: center;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--main-900);
        .name {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        button.delete {
            margin-left: auto;
            color: var(--main-500);
        }
    }
    .module {
        &.disabled {
            pointer-events: none;
            filter: opacity(0.5);
        }
    }
}
</style>
