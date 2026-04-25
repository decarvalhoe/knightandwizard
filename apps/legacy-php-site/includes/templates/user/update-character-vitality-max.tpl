<h2>Modification de la vitalité</h2>

<form action="update-character.php?update=done" method="post" class="form">
    Vitalité : <input type="number" name="vitality-max-points" value="{$Character->vitalityMax}" min="1">

    <br /><br />

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="vitality-max">
    <input type="submit" value="Modifier" />
</form>
