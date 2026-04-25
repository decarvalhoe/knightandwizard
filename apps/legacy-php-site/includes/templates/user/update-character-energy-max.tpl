<h2>Modification de l'énergie</h2>

<form action="update-character.php?update=done" method="post" class="form">
    Energie : <input type="number" name="energy-max-points" value="{$Character->energyMax}" min="0">

    <br /><br />

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="energy-max">
    <input type="submit" value="Modifier" />
</form>
