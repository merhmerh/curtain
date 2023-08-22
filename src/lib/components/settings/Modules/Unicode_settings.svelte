<script>
import Switch from "$comp/Switch.svelte";
import { saveConfig, setNestedProperty } from "$fn/helper";
import { restartModule } from "../../Unicode/Unicode.svelte";
import { config } from "$routes/app.store";
</script>

<div class="card">
    <div class="context">
        <span class="title">Hide Overlay on copy</span>
        <span class="description"> Hide overlay when symbol is copied to clipboard </span>
    </div>
    <Switch
        isChecked={$config.unicode?.config?.hideOverlayOnCopy ?? false}
        on:change={(e) => {
            setNestedProperty($config, "unicode.config.hideOverlayOnCopy", e.detail);
            saveConfig();
        }} />
</div>

<div class="card">
    <div class="context">
        <span class="title">Reset to default</span>
        <span class="description">Reset to the default set of predefined symbols</span>
    </div>
    <button
        class="warning"
        on:click={() => {
            if ($config.unicode.data) {
                delete $config.unicode.data;
                $config = $config;
                saveConfig();
            }
            restartModule();
        }}>Reset</button>
</div>

<style lang="scss">
button {
    height: fit-content;
}
</style>
