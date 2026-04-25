<h2>Modification du facteur de volonté</h2>

<form action="update-character.php?update=done" method="post" class="form">
    Facteur de volonté : <input type="number" name="will-factor-points" value="{$Character->willFactor}" min="1">

    <br /><br />

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="will-factor">
    <input type="submit" value="Modifier" />
</form>
