<form action="add-character.php" method="post" class="form">
    <h2>Orientation</h2>

    <select name="orientationId">
        {foreach from=$orientationsArray key=k item=orientation}
            <option value="{$orientation['id']}">{$orientation['name']}</option>
        {/foreach}
    </select>

    <br /><br />
    
    <input type="hidden" name="step" value="{$step}">
    <input type="submit" value="Suivant" />
</form>
