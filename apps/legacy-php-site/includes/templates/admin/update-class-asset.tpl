<h1>Ajouter un atout à une classe</h1>

Classe : {$classArray['name']}<br />
Orientation : {$orientationArray['name']}

<form action="update-class-asset.php?id={$classArray['id']}" method="post" class="form">
    Atout :
    <select name="asset-id">
        {foreach from=$assetsArray item=asset}
            <option value="{$asset['id']}">{$asset['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Modifier" />
</form>
