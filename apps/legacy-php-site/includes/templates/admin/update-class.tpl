<h1>Modifier une classe</h1>

<form action="update-class.php?id={$classArray['id']}" method="post" class="form">
    Nom : <input type="text" name="name" value="{$classArray['name']}"><br />

    Orientation :
    <select name="orientation-id">
        {foreach from=$orientationsArray item=orientation}
            <option value="{$orientation['id']}" {if $classArray['orientationId'] == $orientation['id']}selected{/if}>{$orientation['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
