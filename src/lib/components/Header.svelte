<script>
import Icon from "@iconify/svelte";
import { isEditMode } from "$routes/app.store";
import Settings from "$comp/settings/Settings.svelte";
import Modal from "./Modal.svelte";

let settingsModal;

function close() {
    ipc.send("hide");
}

function edit() {
    console.log($isEditMode);
    if (!$isEditMode) {
        $isEditMode = true;
    } else {
        $isEditMode = false;
    }
}
</script>

<svelte:window
    on:keydown={(e) => {
        if (e.code == "KeyP" && e.ctrlKey) {
            settingsModal = !settingsModal;
        }
    }} />

{#if settingsModal}
    <Modal
        background={true}
        escape={false}
        exitOutside={false}
        on:close={() => {
            settingsModal = false;
        }}>
        <Settings />
    </Modal>
{/if}

<div class="header">
    <!-- edit -->
    <button class="none" on:click={edit}>
        {#if !$isEditMode}
            <Icon icon="iconoir:edit-pencil" width="24" />
        {:else}
            <Icon icon="lucide:layout-dashboard" width="24" />
        {/if}
    </button>

    <div class="right">
        <button
            class="none setting"
            on:click={() => {
                settingsModal = !settingsModal;
            }}>
            <Icon icon="majesticons:settings-cog-line" width="30" rotate={1} />
        </button>

        <button class="none close" on:click={close}>
            <Icon icon="mingcute:close-line" width="32" />
        </button>
    </div>
</div>

<style lang="scss">
.header {
    display: flex;
    align-items: center;
    height: 2rem;
    justify-content: left;
    gap: 0.5rem;

    .right {
        display: flex;
        margin-left: auto;
        gap: 0.5rem;
        .setting {
            @include flex-center;
            width: 32px;
            height: 32px;
        }
        .close {
            color: $main-light;
        }
    }
}
</style>
