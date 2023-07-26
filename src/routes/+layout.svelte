<script>
import { onMount } from 'svelte';
import { isEditMode, config } from './app.store';
import '../styles/main.scss';
import { timeout } from '$fn/helper';
import Header from '../lib/components/Header.svelte';
let ipc;
let ready;

onMount(async () => {
    ipc = window.ipc;
    await getConfig();
    ready = true;

    ipc.receive('minimize', async (e) => {
        document.activeElement.blur();
        $isEditMode = false;
    });
});

async function getConfig() {
    ipc = window.ipc;
    const cfg = await ipc.promise('init');
    config.set(cfg);
}
</script>

{#if ready}
    <div class="container">
        <header>
            <Header />
        </header>
        <main>
            <slot />
        </main>
    </div>
{/if}

<style lang="scss">
.container {
    padding: 2rem;
    background-color: transparent;
    height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 3rem;

    main {
        height: calc(100% - 3rem);
        display: grid;
        gap: 100px;
        grid-template-columns: repeat(5, 1fr);
    }
}
</style>
