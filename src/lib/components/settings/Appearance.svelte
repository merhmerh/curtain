<script>
import { config, session } from "$routes/app.store";
import {
    generateShades,
    getCSSVariableValue,
    hexToRgb,
    rgbToHex,
    saveConfig,
    setCSSVariableShades,
    setNestedProperty,
    updateCSSVariable,
} from "$fn/helper";

import ColorSelect from "svelte-color-select";

const ipc = window.ipc;
import Icon from "@iconify/svelte";
import Select from "$comp/Select.svelte";
import { fly } from "svelte/transition";
const columnMax = 5,
    columnMin = 1;
let hex = getCSSVariableValue("--accent");
let rgb = hexToRgb(hex);
let spacing = "96";
let fontList, selectFont, selectedFontIndex, selectedMonospaceIndex;

let columnCount = init();
let showPicker;

function init() {
    if (!$config.modules) {
        $config.modules = ["none"];
    }
    $config = $config;
    saveConfig();
    getFonts();
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
        // console.log("reduce");
        $config.modules.splice(column);
    } else {
        // console.log("increase");

        for (const [i, _] of Array(Number(column)).entries()) {
            if (!$config.modules[i]) {
                $config.modules.push("none");
            }
        }
    }
    $config = $config;
    saveConfig().then(() => {
        // console.log("config saved");
    });
}

async function updateSpacing() {
    setNestedProperty($config, "settings.appearance.gap", spacing);
    updateCSSVariable("--grid-gap", `${spacing}px`);
    saveConfig();
}

async function getFonts() {
    //get current style
    const fontFamily = getCSSVariableValue("--fontFamily");
    const fontMonospace = getCSSVariableValue("--monospace");
    let f;
    if ($session.settings?.fontList) {
        f = $session.settings.fontList;
    } else {
        f = await ipc.promise("getFonts");
    }

    for (const [i, font] of f.entries()) {
        f[i] = font.replace(/"/g, "");
        if (fontFamily == f[i]) {
            selectedFontIndex = i;
        }
        if (fontMonospace == f[i]) {
            selectedMonospaceIndex = i;
        }
    }
    setNestedProperty($session, "settings.fontList", f);
    fontList = f;
}

async function updateFont(font, type) {
    setNestedProperty($config, `settings.appearance.${type}`, font);
    updateCSSVariable(`--${type}`, font);
    saveConfig();
}

function updateAccentColor() {
    setCSSVariableShades(hex);
    setNestedProperty($config, `settings.appearance.accent`, hex);
    saveConfig();
}
</script>

<div class="card">
    <div class="context">
        <span class="title">Columns</span>
        <span class="description"> Number of columns to be displayed </span>
    </div>
    <div class="action">
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

<div class="card">
    <div class="context">
        <span class="title">Column Spacing</span>
        <span class="description"> Spacing between column in pixel (32 - 128px)</span>
    </div>
    <div class="action">
        <Icon icon="mingcute:distribute-spacing-horizontal-line" width="24" />
        <input
            type="number"
            min="32"
            step="16"
            max="128"
            bind:value={spacing}
            on:mousewheel={(e) => {
                e.preventDefault();
                const dY = e.deltaY;
                if (dY < 0) {
                    if (spacing == 128) return;
                    spacing = parseInt(spacing) + 16;
                } else {
                    if (spacing == 32) return;
                    spacing = parseInt(spacing) - 16;
                }
                updateSpacing();
            }} />
    </div>
</div>

<div class="card">
    <div class="context">
        <span class="title">Font Family</span>
        <span class="description">Change the font curtain.</span>
    </div>
    {#if fontList}
        <div class="select">
            <Select
                bind:this={selectFont}
                placeholder={selectedFontIndex ? "" : "Select Font"}
                firstItem={selectedFontIndex}
                searchable={true}
                items={fontList}
                maxHeight={300}
                on:change={(e) => {
                    updateFont(e.detail.value, "fontFamily");
                }} />
        </div>
    {/if}
</div>

<div class="card">
    <div class="context">
        <span class="title">Monospace Font</span>
        <span class="description">Change Monospace Font</span>
    </div>
    {#if fontList}
        <div class="select">
            <Select
                bind:this={selectFont}
                placeholder={selectedMonospaceIndex ? "" : "Select Font"}
                firstItem={selectedMonospaceIndex}
                searchable={true}
                items={fontList}
                maxHeight={300}
                on:change={(e) => {
                    updateFont(e.detail.value, "monospace");
                }} />
        </div>
    {/if}
</div>

<div class="card colorPicker">
    <div class="context">
        <span class="title">Accent Color</span>
        <span class="description">Primary accent color use throughout the app</span>
    </div>
    <div class="inputBox">
        {#if showPicker}
            <div transition:fly class="colorPickerWrapper">
                <ColorSelect
                    r={rgb.r}
                    g={rgb.g}
                    b={rgb.b}
                    on:change={(e) => {
                        const [r, g, b] = e.detail.rgb;
                        rgb = { r, g, b };
                        const h = rgbToHex(r, g, b);
                        hex = h;
                        updateAccentColor();
                    }} />
            </div>
        {/if}
        <button
            class="color none"
            on:click={() => {
                showPicker = !showPicker;
            }} />
        <input type="text" bind:value={hex} on:input={updateAccentColor} />
    </div>
</div>

<style lang="scss">
.colorPicker {
    .color {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 0.25rem;
        background-color: var(--accent);
    }
    .inputBox {
        input {
            text-align: right;
            width: 80px;
            font-family: var(--monospace);
        }
        position: relative;
        .colorPickerWrapper {
            position: absolute;
            right: -1px;
            bottom: 3rem;
            background-color: $bg-p;
            padding: 0.5rem;
            border-radius: 0.5rem;
        }
    }
}

.select {
    width: 300px;
    & :global() {
        font-family: "Arial";
    }
}
.action {
    @include flex-center;
    gap: 0.5rem;
    input {
        width: 48px;
        text-align: center;
    }
}
</style>
