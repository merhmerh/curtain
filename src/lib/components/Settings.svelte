<script>
import Icon from '@iconify/svelte';
import { config } from '$routes/app.store';
import { saveConfig } from '$fn/helper';
import Checkbox from './Checkbox.svelte';
import Switch from './Switch.svelte';
import ShortcutInput from './ShortcutInput.svelte';

const ipc = window.ipc;
const columnMax = 5,
    columnMin = 1;
let columnCount = init();
let selected = 'general';

function init() {
    if (!$config.modules) {
        $config.modules = ['none'];
    }
    $config = $config;
    saveConfig();
    return $config.modules.length;
}

async function updateColumns(column) {
    // const column = e.target.value;
    if (column == $config.modules.length) return;
    if (column < columnMin) {
        columnCount = columnMin;
        return;
    }
    if (column > columnMax) {
        columnCount = columnMax;
        return;
    }

    if (column < $config.modules.length) {
        console.log('reduce');
        $config.modules.splice(column);
    } else {
        console.log('increase');

        for (const [i, _] of Array(Number(column)).entries()) {
            if (!$config.modules[i]) {
                $config.modules.push('none');
            }
        }
    }
    $config = $config;
    saveConfig().then(() => {
        console.log('config saved');
    });
}

async function updateSpacing(gap) {}

function changeNav(name) {
    selected = name;
}

function registerNewOverlayShortcut(k) {
    let arr = [];
    if (k.metaKey) {
        arr.push('Super');
    }
    if (k.shiftKey) {
        arr.push('Shift');
    }
    if (k.altKey) {
        arr.push('Alt');
    }
    if (k.ctrlKey) {
        arr.push('CommandOrControl');
    }
    if (k.key) {
        arr.push(k.key);
    }
    let str = arr.join('+');
    console.log(str);

    ipc.send('registerOverlayShortcut', str);
}
</script>

<div class="container">
    <div class="nav">
        <button
            class="none"
            class:active={selected == 'general'}
            on:click={() => {
                changeNav('general');
            }}>
            <div class="icon">
                <Icon icon="carbon:settings" height="24" />
            </div>
            <span>General</span>
        </button>

        <button
            class="none"
            class:active={selected == 'appearance'}
            on:click={() => {
                changeNav('appearance');
            }}>
            <div class="icon">
                <Icon icon="ph:palette" height="24" />
            </div>
            <span>Appearance</span>
        </button>

        <button
            class="none last"
            class:active={selected == 'about'}
            on:click={() => {
                changeNav('about');
            }}>
            <div class="icon">
                <Icon icon="fluent:info-12-regular" height="24" />
            </div>
            <span>About</span>
        </button>
    </div>

    <div class="content general">
        {#if selected == 'general'}
            <div class="card">
                <div class="context">
                    <span class="title">System Startup</span>
                    <span class="description"> Run automatically when my computer starts. </span>
                </div>
                <Switch on:change={() => {}} />
            </div>

            <div class="card">
                <div class="context">
                    <span class="title">Stay on Taskbar</span>
                    <span class="description">
                        Keep icon hidden on the taskbar while minimized.
                    </span>
                </div>
                <Switch on:change={() => {}} />
            </div>

            <div class="card column">
                <div class="context">
                    <span class="title">Toggle Overlay</span>
                    <span class="description"> Customize the shortcut to show the overlay </span>
                </div>
                <ShortcutInput
                    on:listening={() => {
                        ipc.send('blockGlobalShortcut');
                    }}
                    on:release={(e) => {
                        registerNewOverlayShortcut(e.detail);
                    }} />
            </div>
        {/if}

        {#if selected == 'appearance'}
            <div class="general">
                <div>
                    <Icon icon="ph:columns" width="24" />
                    <input
                        type="number"
                        min="1"
                        max="6"
                        on:mousewheel={(e) => {
                            e.preventDefault();
                            const dY = e.deltaY;
                            if (dY < 0) {
                                if (columnCount == columnMax) return;
                                columnCount++;
                            } else {
                                if (columnCount == columnMin) return;
                                columnCount--;
                            }
                            updateColumns(columnCount);
                        }}
                        bind:value={columnCount}
                        on:change={(e) => {
                            updateColumns(e.target.value);
                        }} />
                </div>

                <div>
                    <Icon icon="mingcute:distribute-spacing-horizontal-line" width="24" />
                    <input
                        type="number"
                        min="16"
                        max="200"
                        on:change={(e) => {
                            updateColumns(e.target.value);
                        }} />
                </div>
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
.container {
    position: fixed;
    left: 1600px;
    display: grid;
    grid-template-columns: auto 600px;
    background-color: $bg-s;
}
.nav {
    background-color: $bg-alt;
    padding: 2rem;
    padding-inline: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 200px;
    button {
        display: flex;
        gap: 0.5rem;
        width: 100%;
        justify-content: flex-start;
        border-radius: 0.5rem;
        padding-block: 0.5rem;
        padding-inline: 0.5rem;
        &:hover {
            background-color: var(--main-900);
        }
        &:focus-visible {
            outline: 1px solid var(--accent-400) !important;
        }
        &.active {
            background-color: $bg-p;
            color: var(--main-200);
        }
        &.last {
            margin-top: auto;
        }
        .icon {
            @include flex-center;
        }
    }
}
.content {
    // background-color: beige;
    padding: 2rem;
    min-height: 600px;

    &.general {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .card {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.5rem;
        justify-content: space-between;
        &.column {
            display: flex;
            flex-direction: column;
        }
        .context {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            span.title {
                font-weight: 600;
                color: var(--main-200);
            }
            span.description {
                font-size: 0.875rem;
            }
        }
        &:not(:last-child) {
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--main-800);
        }
    }
}
</style>
