<script>
import { session } from "$routes/app.store";
import Icon from "@iconify/svelte";
import { fly } from "svelte/transition";

let bling;
</script>

<div class="about">
    <div class="icon">
        <button
            class=" none img"
            on:click={() => {
                bling = !bling;
            }}>
            {#if bling}
                <div transition:fly={{ duration: 500 }} class="bling one">
                    <Icon icon="emojione:sparkles" height="32" width="32" />
                </div>
                <div transition:fly={{ duration: 500, delay: 500 }} class="bling two">
                    <Icon icon="emojione-v1:sparkles" height="32" width="32" />
                </div>
            {/if}
            <img src="./icon-64.svg" alt="" />
        </button>
        <span>CURTAIN</span>
    </div>
    <div class="version">
        {$session.version}
    </div>
    <span
        >🖌️ Made with passion by <a target="_blank" href="https://github.com/merhmerh">merhmerh</a
        ></span>

    <div class="link">
        <a target="_blank" href="https://github.com/merhmerh/curtain">
            <div class="icon">
                <Icon icon="mdi:github" height="32" />
            </div>
            Github Repo
        </a>
    </div>
</div>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Viga&display=swap");

.about {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--main-500);
    margin: auto;
}
.icon {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    .img {
        width: 64px;
        height: 64px;
        position: relative;
        .bling {
            position: absolute;
            &.one {
                right: -1rem;
                top: -1rem;
                animation: sparkle3 1s infinite;
                opacity: 1;
                @keyframes sparkle3 {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.25;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            }
            &.two {
                bottom: -1rem;
                left: -1rem;
                animation: sparkle4 1s infinite;
                opacity: 1;
                @keyframes sparkle4 {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.25;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            }
        }
    }
    span {
        font-size: 24px;
        color: #949fbb;
        font-family: "Viga", sans-serif;
    }
}
span {
    font-size: 0.875rem;
}
.link {
    margin-top: 4rem;
    a {
        @include flex-center;
        text-decoration: none;
        gap: 0.5rem;
        color: var(--main-500);
        .icon {
        }
    }
}
</style>
