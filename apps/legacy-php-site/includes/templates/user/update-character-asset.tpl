<h1>Modification d'atout</h1>

<form action="update-character.php?update=done" method="post" class="form">

    {$assetArray['name']} : <input type="number" name="asset-points" value="{$assetArray['points']}" min="1">

    <br /><br />

    <input type="hidden" name="asset-id" value="{$assetArray['id']}">
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="asset">
    <input type="submit" value="Modifier" />
</form>
