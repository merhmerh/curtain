<script>
import Switch from "$comp/Switch.svelte";
import { saveConfig, setNestedProperty } from "$fn/helper";

import { config } from "$routes/app.store";
</script>

<div class="card">
    <div class="context">
        <span class="title">Hide Overlay on copy</span>
        <span class="description"> Hide overlay when data is copied to clipboard </span>
    </div>
    <Switch
        isChecked={$config.clipboard?.config?.hideOverlayOnCopy ?? false}
        on:change={(e) => {
            setNestedProperty($config, "clipboard.config.hideOverlayOnCopy", e.detail);
            saveConfig();
        }} />
</div>

<style lang="scss">
//
</style>
