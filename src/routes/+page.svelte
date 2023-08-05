<script>
import Clipboard from "$comp/Clipboard.svelte";
import Notify from "$comp/Notify/Notify.svelte";
import Unicode from "$comp/Unicode.svelte";
import { saveConfig } from "$fn/helper";
import Note from "../lib/components/Note.svelte";
import Shortcut from "../lib/components/Shortcut.svelte";
import Todo from "../lib/components/Todo.svelte";
import Utilities from "../lib/components/Utilities.svelte";
import Wrapper from "../lib/components/Wrapper.svelte";
import { isEditMode, config, blockGlobalShortcut } from "./app.store";

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
            {#if module == "clipboard"}
                <Clipboard />
            {:else if module == "unicode"}
                <Unicode />
            {:else if module == "note"}
                <Note />
            {:else if module == "todo"}
                <Todo />
            {:else if module == "shortcut"}
                <Shortcut />
            {:else if module == "utilities"}
                <Utilities />
            {:else if module == "none"}
                <!--  -->
            {/if}
        </Wrapper>
    {/each}
{/if}
