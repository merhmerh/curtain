<script>
import Kbs from '$comp/kbs.svelte';
import Note from '../lib/components/Note.svelte';
import Shortcut from '../lib/components/Shortcut.svelte';
import Todo from '../lib/components/Todo.svelte';
import Utilities from '../lib/components/Utilities.svelte';
import Wrapper from '../lib/components/Wrapper.svelte';
import { isEditMode, config, blockGlobalShortcut } from './app.store';

function handleShortcut(e) {
    if ($blockGlobalShortcut) return;
    if (e.ctrlKey && e.code == 'KeyE') {
        $isEditMode = !$isEditMode;
    }
}
</script>

<svelte:window on:keydown={handleShortcut} />

{#each $config.modules as module, index}
    <Wrapper {index}>
        {#if module == 'kbs'}
            <Kbs />
        {:else if module == 'note'}
            <Note />
        {:else if module == 'todo'}
            <Todo />
        {:else if module == 'shortcut'}
            <Shortcut />
        {:else if module == 'utilities'}
            <Utilities />
        {:else if module == 'none'}
            <!--  -->
        {/if}
    </Wrapper>
{/each}
