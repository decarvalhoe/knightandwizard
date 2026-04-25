<h1>Ajouter une classe</h1>

<form action="add-class.php" method="post" class="form">
    Orientation :
    <select name="orientation-id">
        {foreach from=$orientationsArray item=orientation}
            <option value="{$orientation['id']}">{$orientation['name']}</option>
        {/foreach}
    </select>

    <br />

    Nom : <input type="text" name="name">

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
