<script>
import Converter from "$comp/Converter/Converter.svelte";
import Glossary from "$comp/Glossary/Glossary.svelte";
import Alarm from "./Alarm.svelte";
</script>

<div class="container">
    <Alarm />
    <Converter />
    <Glossary />
</div>

<style lang="scss">
.container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
}
</style>
