<h2>Modification du facteur de vitesse</h2>

<form action="update-character.php?update=done" method="post" class="form">
    Facteur de vitesse : <input type="number" name="speed-factor-points" value="{$Character->speedFactor}" min="1">

    <br /><br />

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="speed-factor">
    <input type="submit" value="Modifier" />
</form>
