<h1>Modification le nom du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Nom <input type="text" name="newName" value="{$Character->name}">

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="name">
    <input type="submit" value="Modifier" />
</form>
