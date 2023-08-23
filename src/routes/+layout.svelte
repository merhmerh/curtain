<script>
import { onMount } from "svelte";
import { isEditMode, config, session } from "./app.store";
import "../styles/main.scss";
import Icon from "@iconify/svelte";
import Header from "../lib/components/Header.svelte";
import Modal from "$comp/Modal.svelte";
import {
    getCSSVariableValue,
    setCSSVariableShades,
    saveConfig,
    updateCSSVariable,
} from "$fn/helper";
let ipc;
let ready,
    updateAppModal = false,
    downloadedVersion;

onMount(async () => {
    ipc = window.ipc;
    ipc.receive("minimize", async (e) => {
        document.activeElement.blur();
        $isEditMode = false;
    });

    ipc.receive("info", (e) => {
        console.log("info", e);
        if (e.version) {
            $session = e;
        }
    });

    ipc.receive("updateAvailable", async (v) => {
        console.log("update available", v);
        downloadedVersion = v;

        // await timeout(500);
        // updateAppModal = true;
    });

    ipc.receive("updateError", (e) => {
        console.log("update error", e);
    });

    ipc.receive("updateDownloaded", (e) => {
        updateAppModal = true;
    });

    await getConfig();
    cleanup();
    init();
    ready = true;
    console.log($session);
});

async function getConfig() {
    const cfg = await ipc.promise("init");
    console.log(cfg);
    config.set(cfg);
}

function init() {
    const spacing = $config.settings?.appearance?.gap ?? 96;
    updateCSSVariable("--grid-gap", `${spacing}px`);

    const fontFamily =
        $config.settings?.appearance?.fontFamily ?? getCSSVariableValue("--fontFamily");
    const fontMonospace =
        $config.settings?.appearance?.monospace ?? getCSSVariableValue("--monospace");
    const accentHex = $config.settings?.appearance?.accent ?? getCSSVariableValue("--accent");
    updateCSSVariable("--fontFamily", fontFamily);
    updateCSSVariable("--monospace", fontMonospace);
    setCSSVariableShades(accentHex);
}

function restartApp() {
    ipc.send("restartApp");
}

function cleanup() {
    let toSave;

    if ($config.clipboard) {
        delete $config.clipboard;
        toSave = true;
    }

    if ($config.kbs) {
        delete $config.kbs;
        toSave = true;
    }

    if (Array.isArray($config.todos)) {
        const arr = $config.todos;
        $config.todos = {
            data: arr,
        };
        console.log($config);
    }

    if (toSave) {
        saveConfig();
    }
}
</script>

<!-- <button
    on:click={() => {
        ipc.send("moveDisplay");
    }}>move</button> -->
{#if ready}
    {#if updateAppModal}
        <Modal closeButton={false}>
            <div class="modal">
                <div class="logo">
                    <div class="bling one">
                        <Icon icon="emojione:sparkles" height="32" width="32" />
                    </div>
                    <div class="bling two">
                        <Icon icon="emojione-v1:sparkles" height="32" width="32" />
                    </div>
                    <img src="./icon-256.svg" width="64" height="64" alt="logo" />
                </div>
                <div class="content">
                    <div class="version">
                        {$session.version}
                        <div class="icon">
                            <Icon icon="gg:arrow-long-right-r" height="24" />
                        </div>
                        {downloadedVersion}
                    </div>
                    <div class="text">
                        <span>New Version is available</span>

                        <span>Restart the application to apply the updates</span>
                    </div>
                </div>

                <div class="actions">
                    <button
                        class=""
                        on:click={() => {
                            updateAppModal = false;
                        }}>Later</button>
                    <button
                        class="alt"
                        on:click={() => {
                            restartApp();
                        }}>Restart</button>
                </div>
            </div>
        </Modal>
    {/if}

    <div class="container">
        <header>
            <Header />
        </header>
        <main>
            <slot />
        </main>
        <footer>
            <!-- <div class="version">
                {!$session.isDev ? "v" + $session.version : "Dev Version"}
            </div> -->
        </footer>
    </div>
{/if}

<style lang="scss">
.container {
    padding: 2rem;
    background-color: rgba(#000, 0.8);
    height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    overflow: hidden;
    main {
        height: calc(100% - 3rem);
        justify-content: space-between;
        gap: var(--grid-gap);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        transition: all 0.5s ease;
    }

    footer {
        margin-bottom: -1rem;
        display: flex;
        justify-content: flex-end;
        font-size: 0.75rem;
        color: $grey-light;
    }
}

.modal {
    width: 450px;
    background-color: $bg-s;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;

    .logo {
        position: relative;
        width: 64px;
        height: 64px;
        .bling {
            position: absolute;
            &.one {
                top: -10px;
                right: -10px;
                animation: sparkle 1s infinite;
            }
            &.two {
                bottom: -10px;
                left: -10px;
                animation: sparkle 1s infinite;
                animation-delay: 0.5s;
            }
            @keyframes sparkle {
                0% {
                    opacity: 0.25;
                }
                50% {
                    opacity: 1;
                    scale: 1;
                }
                100% {
                    opacity: 0.25;
                }
            }
        }
    }
    .content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        .version {
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: var(--accent-500);
            font-size: 1.25rem;
            .icon {
                @include flex-center;
                color: $main;
            }
        }
        .text {
            display: grid;
            text-align: center;
            gap: 0.25rem;
        }
    }
    .actions {
        margin-top: 1rem;
        width: 100%;
        display: flex;
        justify-content: space-around;
        button {
            padding-block: 0.625rem;
            width: 150px;
        }
    }
}
</style>
