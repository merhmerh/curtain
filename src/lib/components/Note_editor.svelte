<script>
import Icon from "@iconify/svelte";
import { config, markedIsInitialized } from "$routes/app.store";
import { debounce, saveConfig } from "$fn/helper";
import { createEventDispatcher, onMount, tick } from "svelte";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import Modal from "./Modal.svelte";

const dispatch = createEventDispatcher();

if (!$markedIsInitialized) {
    const highlighter = markedHighlight({
        langPrefix: "hljs language-",
        highlight(code, lang) {
            console.log(code);
            const language = hljs.getLanguage(lang) ? lang : "plaintext";
            return hljs.highlight(code, { language }).value;
        },
    });

    // marked.use(highlighter).use({ renderer });
    marked.use(highlighter);
    $markedIsInitialized = true;
}
export let index = 0;
let preview = index == undefined ? false : true,
    totalLines,
    inputTitle,
    currentLine,
    // showLineNumbers = getSettings(),
    showLineNumbers = false,
    textarea,
    html = "",
    lineNumberContainer;
let note = getNote();

$: preview, onPreviewChange();

async function onPreviewChange() {
    await tick();
    console.log(textarea);
    if (textarea && inputTitle) {
        if (!note.title) {
            inputTitle.focus();
        } else {
            textarea.setSelectionRange(note.content.length, note.content.length);
            textarea.focus();
        }
    }

    if (!preview) return;
    updateLineNumbers();
    parseMarkdown(note.content);
}

onMount(() => {
    console.log(index);
    dispatch("open");
});

function parseMarkdown(md) {
    const h = marked.parse(md, { silent: true });
    const d = document.createElement("div");
    d.innerHTML = h;
    d.querySelectorAll("a").forEach((a) => {
        a.setAttribute("target", "_blank");
    });
    html = d.innerHTML;
}

function getSettings() {
    $config.settings ??= {};
    $config.settings.notes ??= {};
    $config.settings.notes.showLineNumbers ??= false;

    saveConfig();
    return $config.settings.notes.showLineNumbers;
}

function getNote() {
    if (!$config.note || index == null) {
        return { title: "", content: "" };
    }
    return $config.note[index];
}

const autoSave = debounce(save, 1000);

async function save() {
    if (!note.title && !note.content) {
        return;
    }
    if (!$config.note) {
        $config.note = [];
    }

    if (index == null) {
        $config.note.push(note);
        $config = $config;
        index = $config.note.length - 1;
        // console.log('item is now at', index);
    } else {
        // console.log('save to extg', index);
        $config.note[index] = note;
    }
    $config = $config;
    await saveConfig();
}

async function close() {
    $config = $config;
    save();
    dispatch("close");
}

function remove() {
    $config.note.splice(index, 1);
    $config = $config;
    saveConfig();
    dispatch("close");
}

async function handleKeydown(e) {
    if (e.ctrlKey && e.code == "KeyW") {
        return close();
    }

    if (e.ctrlKey && e.code == "KeyE") {
        preview = !preview;
    }
}

function updateLineNumbers() {
    totalLines = note.content.split("\n").length;
    console.log("totalLine", totalLines);
    if (!textarea) return;
    currentLine = textarea.value.substr(0, textarea.selectionStart).split("\n").length;
}

function scrollLineNumber(t) {
    lineNumberContainer.scrollTop = t;
}
</script>

<svelte:window on:keydown={handleKeydown} />

<Modal transition={300} on:close={close} closeButton={false}>
    <div class="container">
        <div class="header">
            <div class="title">
                <span>notes</span> /
                <span>{note.title ? note.title.replace(/\s/g, "_") : "MyNote"}.md</span>
            </div>
            <div class="actions">
                {#if !preview}
                    <!-- <button
                        class="none"
                        on:click={() => {
                            showLineNumbers = !showLineNumbers;
                            $config.settings.notes.showLineNumbers = showLineNumbers;
                            saveConfig();
                        }}>
                        {#if !showLineNumbers}
                            <Icon icon="ri:list-ordered-2" height="24" />
                        {:else}
                            <Icon icon="charm:menu-hamburger" height="24" />
                        {/if}
                    </button> -->
                {/if}

                <button
                    class="none"
                    on:click={() => {
                        preview = !preview;
                    }}>
                    {#if !preview}
                        <Icon icon="ps:magnifying-glass" width="24" />
                    {:else}
                        <Icon icon="iconamoon:edit" width="24" />
                    {/if}
                </button>

                <button class="none warning" on:click={remove}>
                    <Icon icon="mingcute:delete-2-line" height="24" />
                </button>

                <button class="none" on:click={close}>
                    <Icon icon="ep:close-bold" width="24" />
                </button>
            </div>
        </div>

        <div class="paper" class:editMode={!preview}>
            {#if preview}
                <div class="viewer">
                    <div class="title">{note.title}</div>
                    <div class="md">
                        {@html html}
                    </div>
                </div>
            {:else}
                <input
                    type="text"
                    bind:this={inputTitle}
                    bind:value={note.title}
                    on:input={autoSave}
                    placeholder="Title" />
                <div class="editor">
                    {#if showLineNumbers}
                        <div class="lineNumbers" bind:this={lineNumberContainer}>
                            {#each Array(totalLines) as line, i}
                                <div class:active={currentLine == i + 1}>{i + 1}</div>
                            {/each}
                        </div>
                    {/if}
                    <textarea
                        bind:this={textarea}
                        on:load={() => {
                            textarea = textarea;
                        }}
                        bind:value={note.content}
                        on:input={autoSave}
                        on:input={updateLineNumbers}
                        on:keydown={async (e) => {
                            if (
                                e.key == "ArrowUp" ||
                                e.key == "ArrowDown" ||
                                e.key == "ArrowLeft" ||
                                e.key == "ArrowRight"
                            ) {
                                await tick();
                                requestAnimationFrame(() => {
                                    currentLine = textarea.value
                                        .substr(0, textarea.selectionStart)
                                        .split("\n").length;
                                    console.log(currentLine);
                                });
                            }
                        }}
                        on:click={updateLineNumbers}
                        on:scroll={(e) => {
                            scrollLineNumber(e.target.scrollTop);
                        }}
                        placeholder="Start Typing" />
                </div>
            {/if}
        </div>
    </div>
</Modal>

<style lang="scss">
.container {
    z-index: 101;
    width: auto;
    position: fixed;
    padding: 2rem;
    padding-top: 0.5rem;
    background-color: $bg-p;

    // background-color: red;
    // background-color: $bg-alt;
    border-radius: 1rem;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    display: grid;
    justify-content: center;

    .header {
        display: flex;
        align-items: center;
        padding-block: 1rem;
        .title {
            span:first-child {
                color: $grey-light;
            }
            span:last-child {
                font-weight: 600;
            }
        }
        .actions {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-left: auto;
            button.warning {
                &:hover {
                    color: $red;
                }
            }
        }
    }

    .paper {
        background-color: $bg-p;
        height: 80vh;
        aspect-ratio: 0.7;
        padding: 1rem;
        border-radius: 0.5rem;
        user-select: auto !important;
        border-left: 2px solid transparent;

        &.editMode {
            border-radius: 0;
            border-left: 2px solid var(--accent-400);
        }
        input {
            width: 100%;
            border: 0;
            border-radius: 0;
            font-size: 2rem;
            font-weight: 600;
            border-bottom: 2px solid $grey-light;
            padding-inline: 0;
            &:hover,
            &:focus {
                outline: 0;
            }
            &::placeholder {
                font-size: 2rem;
                color: $grey-lighter;
            }
        }
        .editor {
            display: flex;
            margin-top: 2rem;
            gap: 1rem;
            height: calc(100% - 5rem);
            .lineNumbers {
                position: sticky;
                overflow: hidden;
                top: 0;
                display: flex;
                flex-direction: column;
                width: 2rem;
                border-right: 1px solid $grey-lighter;
                color: $grey-lighter;
                padding-right: 0.25rem;
                div {
                    text-align: right;
                    height: fit-content;
                    &.active {
                        color: $grey;
                    }
                }
            }
            textarea {
                background-color: transparent;
                padding: 0;
                width: 100%;
                resize: none;
                outline: none;
                border: none;
                &::placeholder {
                    font-size: 1rem;
                    color: $grey-lighter;
                }
            }
        }
        .viewer {
            height: 100%;
            overflow-y: auto;
            padding-bottom: 1rem;
            user-select: all !important;
            .title {
                user-select: auto !important;
                font-size: 2rem;
                font-weight: 600;
                padding-block: 0.5rem;
            }
        }
    }
}
</style>
