<script>
import Icon from "@iconify/svelte";

import General from "./General.svelte";
import Appearance from "./Appearance.svelte";
import About from "./About.svelte";
import ModulesList from "./Modules/Modules_List.svelte";
import UnicodeSettings from "./Modules/Unicode_settings.svelte";
import TodosSettings from "./Modules/Todos_settings.svelte";

let selected = "general";

function changeNav(name) {
    selected = name;
}
</script>

<div class="container">
    <div class="nav">
        <button
            class="none"
            class:active={selected == "general"}
            on:click={() => {
                changeNav("general");
            }}>
            <div class="icon">
                <Icon icon="carbon:settings" height="24" />
            </div>
            <span>General</span>
        </button>

        <button
            class="none"
            class:active={selected == "appearance"}
            on:click={() => {
                changeNav("appearance");
            }}>
            <div class="icon">
                <Icon icon="ph:palette" height="24" />
            </div>
            <span>Appearance</span>
        </button>

        <ModulesList
            on:selectModule={(module) => {
                selected = module;
            }}>
            <button
                class="none"
                class:active={selected == "unicode"}
                on:click={() => {
                    changeNav("unicode");
                }}>
                <Icon icon="uil:spade" height="24" />
                <span>Unicode</span>
            </button>

            <button
                class="none"
                class:active={selected == "todo"}
                on:click={() => {
                    changeNav("todos");
                }}>
                <Icon icon="icon-park-outline:list" height="24" />
                <span>Todo List</span>
            </button>
        </ModulesList>

        <button
            class="none last"
            class:active={selected == "about"}
            on:click={() => {
                changeNav("about");
            }}>
            <div class="icon">
                <Icon icon="fluent:info-12-regular" height="24" />
            </div>
            <span>About</span>
        </button>
    </div>

    <div class="SettingsContent">
        {#if selected == "general"}
            <General />
        {/if}

        {#if selected == "appearance"}
            <Appearance />
        {/if}

        {#if selected == "about"}
            <About />
        {/if}

        {#if selected == "unicode"}
            <UnicodeSettings />
        {/if}

        {#if selected == "todos"}
            <TodosSettings />
        {/if}
    </div>
</div>

<style lang="scss">
.container {
    // position: fixed;
    // left: 1600px;
    padding-right: 2rem;
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
    width: 220px;
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
.SettingsContent {
    // background-color: beige;
    margin-top: 1rem;
    padding: 2rem;
    min-height: 600px;
    height: 600px;
    overflow: auto;
    scrollbar-gutter: stable;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
</style>
