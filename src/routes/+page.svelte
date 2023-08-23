<script>
import { saveConfig } from "$fn/helper";
import Notify from "$comp/Notify/Notify.svelte";
import Wrapper from "$comp/Wrapper.svelte";
import Todo from "$comp/Todo/Todo.svelte";
import Shortcut from "$comp/Shortcut/Shortcut.svelte";
import Note from "$comp/Note/Note.svelte";
import Utilities from "$comp/Utilities/Utilities.svelte";
import Unicode from "$comp/Unicode/Unicode.svelte";
import { isEditMode, config, blockGlobalShortcut } from "./app.store";
import Custom from "$comp/Custom/Custom.svelte";

function handleShortcut(e) {
    if ($blockGlobalShortcut) return;
    if (e.ctrlKey && e.code == "KeyE") {
        $isEditMode = !$isEditMode;
    }
}

if (!$config.modules) {
    $config.modules = ["todo", "note", "utilities"];
    $config.note = [
        {
            title: "Write your first note",
            content: "Start typing, markdown formatting is available.",
        },
    ];
    saveConfig();
}
</script>

<svelte:window on:keydown={handleShortcut} />

<Notify />

{#if $config.modules}
    {#each $config.modules as module, index}
        <Wrapper {index}>
            {#if module == "unicode"}
                <Unicode />
            {:else if module == "note"}
                <Note />
            {:else if module == "todo"}
                <Todo />
            {:else if module == "shortcut"}
                <Shortcut />
            {:else if module == "utilities"}
                <Utilities />
            {:else if module.split("-")[0] == "custom"}
                <Custom id={module} />
            {:else if module == "none"}
                <!--  -->
            {/if}
        </Wrapper>
    {/each}
{/if}
