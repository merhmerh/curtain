<script>
import Select from "$comp/Select.svelte";

let glossaries = [
    {
        name: "Paper size",
        data: [
            { term: "A0", definition: "841 x 1189 mm" },
            { term: "A1", definition: "564 x 841 mm" },
            { term: "A2", definition: "420 x 594 mm" },
            { term: "A3", definition: "297 x 420 mm" },
            { term: "A4", definition: "210 x 297 mm" },
            { term: "A5", definition: "148.5 x 210 mm" },
            { term: "A6", definition: "105 x 148.5 mm" },
        ],
    },
    {
        name: "Screen size",
        data: [
            { term: "HD", definition: "1280 x 720" },
            { term: "FHD", definition: "1920 x 1080" },
            { term: "QHD 2k", definition: "2560 x 1440" },
            { term: "UHD 4k", definition: "3840 x 2160" },
            { term: "UHD 8k", definition: "7680 x 4320" },
        ],
    },
];
let glossary = glossaries[0].data;
</script>

<div class="container">
    <Select
        size="small"
        items={glossaries.map((x) => x.name)}
        on:change={(e) => {
            glossary = glossaries.filter((x) => x.name == e.detail.value)[0].data;
        }} />

    <div class="glossary">
        <table>
            <thead>
                <tr>
                    <th> <div>Term</div></th>
                    <th><div>Definition</div></th>
                </tr>
            </thead>
            <tbody>
                {#each glossary as { term, definition }}
                    <tr>
                        <td><div>{term}</div></td>
                        <td><div>{definition}</div></td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style lang="scss">
.container {
    display: grid;
    gap: 1rem;
    background-color: $bg-p;
    border-radius: 0.5rem;
    padding: 1rem;
}
.glossary {
    // padding: 0.5rem 1rem;
    user-select: text;

    table {
        width: 100%;
        table-layout: auto;
        border-collapse: collapse;
        td,
        th {
            border-bottom: 1px solid var(--main-900);
            padding-block: 0.25rem;
            div {
                user-select: text;
                text-align: left;
            }
        }
    }
}
</style>
