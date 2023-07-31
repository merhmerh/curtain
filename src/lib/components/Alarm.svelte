<script>
import { timeout } from "$fn/helper";
import Icon from "@iconify/svelte";

let hand, clockFace, alarm, alarmRinging, canStartTimer;
let handRotation = 0;
let transitionDuration = 0.5;
let radius = 112;
let stroke = 6;
let diameter = radius * 2;
let length = Math.PI * 2 * radius;
let offset = -length - length * 1;

let timer = { min: "", sec: "" },
    timerRunning,
    timerSelector;

checkTimer();

function timerStart() {
    console.log(timer, "timer start");
    timerRunning = true;
    timer.original = parseFloat(timer.min) * 60 || 0 + parseFloat(timer.sec) || 0;
    timer.ongoing = true;
    timer.remaining = timer.original;
    timer.current = timer.original;
    timer.before = new Date().getTime();

    hand.style.transition = `all ${transitionDuration}s`;
    clockFace.style.transition = `all ${transitionDuration}s`;
    elapseTime();
}

function timerResume() {
    console.log("resume");
    timerRunning = true;
    timer.before = new Date().getTime();
    timer.fromResume = true;
    timer.current = timer.remaining;
    elapseTime();
}

async function elapseTime() {
    if (!timerRunning) return;

    if (timer.remaining == 0) {
        timerEnd();
    }
    setTimeout(() => {
        if (!timerRunning) return;
        const now = new Date().getTime();
        const elapse = Math.floor((now - timer.before) / 1000);
        if (!timer.fromResume) {
            timer.remaining = timer.current - elapse;
        } else {
            timer.fromResume = false;
        }
        // console.log('tick', timer.remaining);
        handRotation = 360 * ((timer.original - timer.remaining) / timer.original);
        offset = -length - length * (timer.remaining / timer.original) * 0.97;

        timer.min = leftPad(Math.floor(timer.remaining / 60));
        timer.sec = leftPad(timer.remaining % 60);
        elapseTime();
    }, 250);
}

function timerPause() {
    console.log("pause", timer);
    timerRunning = false;
}

function leftPad(val) {
    val = val.toString();
    return val.padStart(2, "0");
}

async function timerEnd() {
    timer.ongoing = false;
    canStartTimer = false;
    timerRunning = false;

    alarm.play();
    alarmRinging = true;
    await timeout(100);
    hand.style.transition = "none";
    offset = -length - length * 1;
    handRotation = 0;
    await timeout(100);
    hand.style.transition = `all ${transitionDuration}s`;
    return;
}

function alarmStop() {
    alarm.pause();
    alarm.currentTime = 0;
    alarmRinging = false;
}

function checkTimer() {
    timer.original = parseFloat(timer.min * 60) || 0 + parseFloat(timer.sec) || 0;
    if (timer.original > 0) {
        canStartTimer = true;
    }
}

async function reset() {
    if (!timer.original) return;
    timer.min = leftPad(Math.floor(timer.original / 60));
    timer.sec = leftPad(timer.original % 60);
    timer.remaining = timer.original;

    offset = -length - length * 1;
    handRotation = 0;
    canStartTimer = true;
    timer.ongoing = false;
    return (timerRunning = false);
}
</script>

<div class="container">
    <audio
        bind:this={alarm}
        on:loadedmetadata={() => {
            alarm.volume = 0.2;
        }}>
        <source src="alarm.wav" type="audio/wav" />
    </audio>
    <div class="clockFace">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={diameter}
            height={diameter}
            viewBox="0 0 {diameter} {diameter}"
            fill="none">
            <circle
                bind:this={clockFace}
                transform="rotate(270 {radius} {radius})"
                cx={radius}
                cy={radius}
                r={radius - 3}
                stroke-linecap="round"
                stroke-width={stroke}
                stroke-dasharray={length}
                stroke-dashoffset={offset} />
        </svg>
        <div bind:this={hand} class="hand" style="transform:rotate(-{handRotation}deg) " />
        {#if alarmRinging}
            <button class="stopAlarm none" on:click={alarmStop}>
                <div class="icon">
                    <Icon icon="ri:bell-line" width="80" />
                </div>
            </button>
        {/if}
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="control">
        <span class="title">Timer</span>
        <div class="timer" bind:this={timerSelector}>
            <input
                type="number"
                placeholder="00"
                min="0"
                max="59"
                disabled={timer.ongoing}
                bind:value={timer.min}
                on:click={(e) => {
                    e.target.select();
                }}
                on:input={(e) => {
                    if (timer.min > 60) {
                        timer.min = 60;
                    }
                    if (e.target.value.length > 1) {
                        e.preventDefault();
                        e.target.nextElementSibling.nextElementSibling.select();
                    }
                    checkTimer();
                }} />
            <span>:</span>
            <input
                type="number"
                placeholder="00"
                min="0"
                max="59"
                disabled={timer.ongoing}
                bind:value={timer.sec}
                on:click={(e) => {
                    e.target.select();
                }}
                on:input={(e) => {
                    if (timer.sec > 60) {
                        timer.sec = 60;
                    }
                    if (!e.target.value) {
                        e.target.previousElementSibling.previousElementSibling.select();
                    }
                    checkTimer();
                }} />
        </div>
        <div class="actions">
            {#if timerRunning}
                <button class="none" on:click={timerPause}>
                    <Icon icon="mingcute:pause-fill" width="24" />
                </button>
            {:else}
                <button
                    class="none"
                    class:disabled={!canStartTimer}
                    on:click={() => {
                        if (!canStartTimer) return;
                        if (timer.ongoing) {
                            timerResume();
                        } else {
                            timerStart();
                        }
                    }}>
                    <Icon icon="solar:play-bold" width="24" />
                </button>
            {/if}
            <button
                class="none"
                class:disabled={!canStartTimer}
                on:click={() => {
                    reset();
                }}><Icon icon="jam:refresh" width="24" /></button>
        </div>
    </div>
</div>

<style lang="scss">
.container {
    width: 250px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-inline: auto;
    .clockFace {
        width: 100%;
        aspect-ratio: 1;
        &:after {
            content: "";
            z-index: -1;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 212px;
            height: 212px;
            border: 6px solid var(--grey-lightest);
            border-radius: 100%;
        }
        svg {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            stroke: var(--accent-500);
            pointer-events: none;
        }
        .hand {
            pointer-events: none;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 5;
            &:after {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                content: "";
                width: 1.5rem;
                height: 1.5rem;
                background-color: $bg-p;
                border: 4px solid var(--accent-500);
                border-radius: 100%;
            }
        }
        .stopAlarm {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
            width: 85%;
            height: 85%;
            background-color: rgba(#000, 0.5);
            color: $grey;
            border-radius: 100%;
            @include flex-center;
            flex-direction: column;
            font-size: 1rem;
            .icon {
                margin-left: 4px;
                color: $red;
                transform: rotate(-45deg);
                animation: rockAnimation 0.5s ease-in-out infinite;
            }
            @keyframes rockAnimation {
                0% {
                    transform: rotate(-65deg);
                }
                50% {
                    transform: rotate(-35deg);
                }
                100% {
                    transform: rotate(-65deg);
                }
            }
        }
    }
    .control {
        position: absolute;
        display: grid;
        gap: 0.5rem;
        .title {
            display: flex;
            justify-content: center;
            color: $main-light;
        }
        .timer {
            display: flex;
            align-items: center;
            // gap: 0.25rem;
            font-size: 3rem;
            cursor: pointer;
            span {
                color: $main-light;
                font-size: 1.5rem;
                font-weight: 600;
            }
            input {
                cursor: pointer;
                height: 60px;
                width: 60px;
                padding-inline: 0;
                background-color: transparent;
                display: flex;
                justify-content: center;
                text-align: center;
                outline: none;
                border: none;
                color: #dfdfdf;
                // caret-color: transparent;
                &[disabled] {
                    cursor: default;
                }
                &::placeholder {
                    font-size: 3rem;
                    color: $grey-light;
                }
                &:focus,
                &:active,
                &:hover {
                    outline: none;
                    border-color: none;
                }
            }
        }
        .actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            button {
                color: var(--accent-500);
                &.disabled {
                    color: $grey-lighter;
                    cursor: default;
                }
            }
        }
    }
}
</style>
