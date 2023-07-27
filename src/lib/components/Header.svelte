<script>
import Icon from '@iconify/svelte';
import { isEditMode, config, session } from '$routes/app.store';
import { saveConfig } from '$fn/helper';

const columnMax = 5,
    columnMin = 1;
// let columnCount = $config.modules.length;
let columnCount = init();

function init() {
    if (!$config.modules) {
        $config.modules = ['none'];
    }
    $config = $config;
    saveConfig();
    return $config.modules.length;
}

function close() {
    ipc.send('hide');
}
function edit() {
    console.log($isEditMode);
    if (!$isEditMode) {
        $isEditMode = true;
    } else {
        $isEditMode = false;
    }
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
</script>

<div class="header">
    <button class="none" on:click={edit}>
        {#if !$isEditMode}
            <Icon icon="iconoir:edit-pencil" width="24" />
        {:else}
            <!-- <Icon icon="fluent:save-16-regular" width="24" /> -->
            <Icon icon="lucide:layout-dashboard" width="24" />
        {/if}
    </button>

    {#if $isEditMode}
        <div class="settings">
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
        </div>
    {/if}

    <button class="none close" on:click={close}>
        <Icon icon="mingcute:close-line" width="32" />
    </button>
</div>

<style lang="scss">
.header {
    display: flex;
    align-items: center;
    height: 2rem;
    justify-content: left;
    gap: 1rem;
    .close {
        margin-left: auto;
        color: $main-light;
    }
}

.settings {
    margin-left: 100px;
    div {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: $main-light;
        input {
            width: 3rem;
            text-align: center;
        }
    }
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
