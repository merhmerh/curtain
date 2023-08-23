<script>
import Select from "$comp/Select.svelte";
import { onMount } from "svelte";

let fromValue = 1,
    toValue;
let fromSelected, toSelected;

const measurements = [
    {
        measurement: "Length",
        units: [
            { value: "mm", label: "Millimeter", rate: 1000, base: 0.001 },
            { value: "m", label: "Meter", rate: 1, base: 1 },
            { value: "cm", label: "Centimeter", rate: 100, base: 0.01 },
            { value: "km", label: "Kilometer", rate: 0.001, base: 1000 },
            { value: "in", label: "Inch", rate: 39.3701, base: 0.0254 },
            { value: "ft", label: "Foot", rate: 3.28084, base: 0.3048 },
            { value: "yd", label: "Yard", rate: 1.09361, base: 0.9144 },
            { value: "mi", label: "Mile", rate: 0.000621371, base: 1609.34 },
            { value: "NM", label: "Nautical mile", rate: 0.000539956803, base: 1852 },
        ],
    },
    {
        measurement: "Area",
        units: [
            { value: "sqmm", label: "Square millimeter", rate: 1000000, base: 0.000001 },
            { value: "sqm", label: "Square meter", rate: 1, base: 1 },
            { value: "sqkm", label: "Square kilometer", rate: 0.000001, base: 1000000 },
            { value: "sqin", label: "Square inch", rate: 1550, base: 0.00064516 },
            { value: "sqft", label: "Square foot", rate: 10.7639, base: 0.092903 },
            { value: "sqmi", label: "Square mile", rate: 0.0000003861, base: 2590000 },
            { value: "acre", label: "Acre", rate: 0.000247105, base: 4046.86 },
        ],
    },
    {
        measurement: "Mass",
        units: [
            { value: "mg", label: "Milligram", rate: 1000000, base: 0.000001 },
            { value: "g", label: "Gram", rate: 1000, base: 0.001 },
            { value: "kg", label: "Kilogram", rate: 1, base: 1 },
            { value: "t", label: "Tonne", rate: 0.001, base: 1000 },
            { value: "lb", label: "Pound", rate: 2.20462, base: 0.453592 },
            { value: "oz", label: "Ounce", rate: 35.274, base: 0.0283495 },
        ],
    },
];
let selectedMeasurement = measurements[0].units;

function convert() {
    if (fromSelected.rate == toSelected.rate) {
        toValue = fromValue;
        toValue = formatNumber(toValue);
        return;
    }

    const base = fromValue * fromSelected.base;

    toValue = base * toSelected.rate;
    toValue = formatNumber(toValue);
}

function formatNumber(number) {
    number = parseFloat(number);
    if (typeof number !== "number") {
        return NaN;
    }

    return number;
}

onMount(() => {
    convert();
});
</script>

<div class="container">
    <div class="inputBox measure">
        <Select
            size={"smaller"}
            items={measurements.map((x) => x.measurement)}
            on:change={(e) => {
                const filter = measurements.filter((x) => x.measurement == e.detail.value);
                selectedMeasurement = filter[0].units;
                fromSelected = selectedMeasurement[0];
                toSelected = selectedMeasurement[1];
                convert();
            }} />
        <!-- <input type="text" placeholder="50m to mm" /> -->
    </div>
    <div class="converter">
        <div class="inputBox">
            <input type="text" bind:value={fromValue} on:input={convert} />
            {#key selectedMeasurement}
                <Select
                    size={"smaller"}
                    items={selectedMeasurement}
                    bind:selected={fromSelected}
                    firstItem="1"
                    on:change={convert} />
            {/key}
        </div>
        <span> = </span>
        <div class="inputBox">
            <input type="text" bind:value={toValue} />
            {#key selectedMeasurement}
                <Select
                    size={"smaller"}
                    items={selectedMeasurement}
                    firstItem="0"
                    bind:selected={toSelected}
                    on:change={convert} />
            {/key}
        </div>
    </div>
</div>

<style lang="scss">
.container {
    display: grid;
    gap: 1rem;
    div.inputBox {
        display: grid;
        width: 100%;
        border-radius: 0.25rem;
        border-color: var(--main-900);
        padding: 0;
        &:focus-within {
            border: 1px solid var(--accent);
        }
        input {
            border-radius: 0.25rem 0.25rem 0rem 0;
            text-align: center;
            width: 100%;
            border: 0;
        }
    }
    .converter {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    & :global(.select) {
        border: 0;
        border-radius: 0 0 0.25rem 0.25rem !important;
        min-width: 0;
        background-color: $bg-s;
        font-size: 0.875rem;
    }

    .measure {
        display: grid;
        grid-template-columns: 125px 1fr;
        padding: 0.25rem !important;
        & :global(.select) {
            border-radius: 0.125rem;
        }
        input {
            height: 24px;
            text-align: left !important;
            padding-inline: 0.5rem;
        }
    }
}
</style>
