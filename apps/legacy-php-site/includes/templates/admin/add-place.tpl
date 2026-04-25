<h1>Ajouter un lieu</h1>

<form action="add-place.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Contenu dans :
    <select name="place-id">s
        {foreach from=$PlacesArray item=Place}
            <option value="{$Place->id}">{$Place->name} - {$Place->status['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Status:
    <select name="status-id">
        {foreach from=$placesStatusArray item=status}
            <option value="{$status['id']}">{$status['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    <input type="checkbox" name="is-capital" value="1"> est une capitale

    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
