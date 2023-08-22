<script>
import Switch from "$comp/Switch.svelte";
import { saveConfig, setNestedProperty } from "$fn/helper";
import { config } from "$routes/app.store";
</script>

<div class="card">
    <div class="context">
        <span class="title">Clear Recycle Bin on start</span>
        <span class="description"
            >Todos deleted will be moved to recycle bin. On app start, recycle bin will be cleared.</span>
    </div>
    <Switch
        isChecked={$config.todos?.config?.clearRecycleBinOnRestart ?? false}
        on:change={(e) => {
            setNestedProperty($config, "todos.config.clearRecycleBinOnRestart", e.detail);
            saveConfig();
        }} />
</div>
