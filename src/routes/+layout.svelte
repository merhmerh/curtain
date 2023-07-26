<script>
import { onMount } from 'svelte';
import { isEditMode, config } from './app.store';
import '../styles/main.scss';
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
        justify-content: space-between;
        gap: 100px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}
</style>
