<script>
import csv from "$lib/others/unicode.csv?raw";

let codes = convertCSVtoJSON(csv);

function convertCSVtoJSON(csv) {
    const arr = csv.split(/\n/);
    const obj = {};
    for (let i = 1; i < arr.length; i++) {
        const [type, symbol, description] = arr[i].replace("\r", "").split(",");
        if (!type) continue;

        if (!obj[type]) {
            obj[type] = [{ symbol, description }];
        } else {
            obj[type].push({ symbol, description });
        }
    }
    return obj;
}
</script>

<div class="container">
    <button>Add Unicode</button>
</div>

<div class="unicodeList-container">
    <input placeholder="Search.." />
    <div class="unicodeList">
        {#each Object.entries(codes) as [category, data]}
            <div class="category">
                <span>{category}</span>
                <div class="category-container">
                    {#each data as { symbol, description }}
                        <button class="none card">
                            <div class="symbol">
                                {symbol}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
    <div class="others">
        <input placeholder="Type characters to copy" />
        <button>Add</button>
    </div>
</div>

<style lang="scss">
.unicodeList-container {
    width: 100%;
    background-color: var(--main-900);
    background-color: $bg-p;
    border-radius: 0.5rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.unicodeList {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    // max-height: 400px;
    padding-right: 0.5rem;
    overflow-y: auto;

    .category {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        .category-container {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 0.25rem;
            button.card {
                border-radius: 0.25rem;
                width: 100%;
                aspect-ratio: 1;
                background-color: $bg-s;
                @include flex-center;

                .symbol {
                    @include flex-center;
                }
                &:hover {
                    background-color: var(--main-800);
                }
            }
        }
    }
}
</style>
