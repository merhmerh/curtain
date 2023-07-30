<script>
export let data;

data = Array.isArray(data) ? data : [data];

function generateID(length) {
    if (!length) {
        length = 8;
    }
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters.charAt(randomIndex);
    }

    return id;
}

const data_arr = (() => {
    const arr = [];
    data.forEach((item, index) => {
        const obj = {
            id: generateID(),
            label: item,
            checked: false,
        };
        arr[index] = obj;
    });
    return arr;
})();

export function getData() {
    return data_arr;
}

export function getChecked() {
    const c = [];
    data_arr.forEach((item) => {
        if (item.checked == true) c.push(item.label);
    });
    return c;
}

export function toggle(data) {
    data.checked = !data.checked;
}
</script>

{#each data_arr as data}
    <div class="container">
        <button
            id={data.id}
            class="checkbox"
            checked={data.checked}
            on:click={() => {
                data.checked = !data.checked;
            }} />
        <label for={data.id}>{data.label}</label>
    </div>
{/each}

<style lang="scss">
.container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: fit-content;
    cursor: pointer;
    background-color: transparent !important;
    outline: 0;
    border: 0;
    &:hover {
        box-shadow: none;
    }
}
button.checkbox {
    width: 16px;
    height: 16px;
    border: 2px solid $grey-light;
    padding: 0;
    background-color: transparent;
    box-shadow: none;
    // background-color: $bg-s;
    border-radius: 0.25rem;

    &[checked='true'] {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        border-color: $accent;

        &:after {
            content: '';
            border-radius: 2px;
            background-color: $accent;
            width: 100%;
            height: 100%;
        }
    }
}
</style>
