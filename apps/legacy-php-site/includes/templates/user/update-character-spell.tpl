<h1>Modification de sort</h1>

<form action="update-character.php?update=done" method="post" class="form">

    {$spellArray['name']} : <input type="number" name="spell-points" value="{$spellArray['points']}" min="0">

    <br /><br />

    <input type="hidden" name="spell-id" value="{$spellArray['id']}">
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="spell">
    <input type="submit" value="Modifier" />
</form>
