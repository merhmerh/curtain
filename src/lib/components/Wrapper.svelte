<script>
import Select from "./Select.svelte";
import { isEditMode, config } from "$routes/app.store";
import { saveConfig, generateID } from "$fn/helper";

export let index;

const options = [
    { value: "unicode", label: "Unicode" },
    { value: "note", label: "Note" },
    { value: "todo", label: "To-do List" },
    { value: "shortcut", label: "Shortcut" },
    { value: "utilities", label: "Utilities" },
    { value: "custom", label: "Custom" },
    { value: "none", label: "None" },
];

function getFirstItem() {
    for (const [i, r] of options.entries()) {
        if ($config.modules[index].split("-")[0] == "custom") {
            const index = options.findIndex((x) => x.value == "custom");
            return index;
        }
        if ($config.modules[index] == r.value) {
            console.log(i);
            return i;
        }
    }
}

function changeModule(e) {
    const selection = e.detail;
    if (selection.value == "custom") {
        $config.modules[index] = `${selection.value}-${generateID(12)}`;
    } else {
        $config.modules[index] = selection.value;
    }

    //get modules
    const customModules = $config.modules.filter((x) => x.split("-")[0] == "custom");
    for (const [key, data] of Object.entries($config)) {
        if (key.includes("custom-")) {
            if (!customModules.includes(key)) {
                delete $config[key];
            }
        }
    }
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
    height: calc(100vh - 4rem - 80px);
    overflow: auto;
}
</style>
