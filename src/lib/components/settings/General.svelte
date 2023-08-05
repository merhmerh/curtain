<script>
import Switch from "$comp/Switch.svelte";
import ShortcutInput from "$comp/ShortcutInput.svelte";
import { config } from "$routes/app.store";
import { saveConfig, setNestedProperty } from "$fn/helper";
import { onMount } from "svelte";

const ipc = window.ipc;
let pageReady;
let overlayShortcut = getOverlayShortcut();
let showRestartPrompt;

onMount(() => {
    if (!$config.settings?.app?.showOnTaskbar) {
        setNestedProperty($config, "settings.app.runOnStartUp", true);
        // console.log($config);
    }

    if (!$config.settings?.app?.showOnTaskbar) {
        setNestedProperty($config, "settings.app.showOnTaskbar", false);
        // console.log($config);
    }

    pageReady = true;
});

function getOverlayShortcut() {
    let str = $config.settings?.app?.kbs_overlay ?? "Shift+CommandOrControl+D";
    // console.log(str);
    return destructureKeys(str);
}

function destructureKeys(str) {
    const arr = str.split("+");
    const key = {};
    if (arr.includes("Super")) {
        key.metaKey = true;
    }
    if (arr.includes("Shift")) {
        key.shiftKey = true;
    }
    if (arr.includes("Alt")) {
        key.altKey = true;
    }
    if (arr.includes("CommandOrControl")) {
        key.ctrlKey = true;
    }
    key.key = arr.pop();
    return key;
}

function registerNewOverlayShortcut(k) {
    let arr = [];
    if (k.metaKey) {
        arr.push("Super");
    }
    if (k.shiftKey) {
        arr.push("Shift");
    }
    if (k.altKey) {
        arr.push("Alt");
    }
    if (k.ctrlKey) {
        arr.push("CommandOrControl");
    }
    if (k.key) {
        arr.push(k.key);
    }
    let str = arr.join("+");
    console.log(str);

    ipc.send("registerOverlayShortcut", str);
}
</script>

{#if pageReady}
    <div class="card">
        <div class="context">
            <span class="title">System Startup</span>
            <span class="description"> Run automatically when my computer starts. </span>
        </div>
        <Switch
            isChecked={$config.settings.app.runOnStartUp}
            on:change={(e) => {
                $config.settings.app.runOnStartUp = e.detail;
                saveConfig();
            }} />
    </div>

    <div class="card">
        <div class="context">
            <span class="title">Stay on Taskbar</span>
            <span class="description"> Keep icon hidden on the taskbar while minimized. </span>
        </div>
        <Switch
            isChecked={$config.settings.app.showOnTaskbar}
            on:change={(e) => {
                $config.settings.app.showOnTaskbar = e.detail;
                saveConfig();
                ipc.send("toggleRunOnStartup");
                showRestartPrompt = true;
            }} />

        {#if showRestartPrompt}
            <span class="restartPrompt">
                <span>Relaunch is required for changes to take effect</span>
                <button
                    class="fit"
                    on:click={() => {
                        ipc.send("relaunch");
                    }}>Relaunch</button>
            </span>
        {/if}
    </div>

    <div class="card column">
        <div class="context">
            <span class="title">Toggle Overlay</span>
            <span class="description"> Customize the shortcut to show the overlay </span>
        </div>
        <ShortcutInput
            input={overlayShortcut}
            on:listening={() => {
                ipc.send("blockGlobalShortcut");
            }}
            on:release={(e) => {
                registerNewOverlayShortcut(e.detail);
            }} />
    </div>
{/if}

<style lang="scss">
.restartPrompt {
    background-color: $bg-alt;
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    width: 100%;
    display: flex;
    gap: 1rem;
    flex-direction: column;
    span {
        font-size: 0.875rem;
    }
}
</style>
