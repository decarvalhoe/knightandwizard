<h1>Modification l'image de profil du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form" enctype="multipart/form-data">
    <input type="file" name="characterProfilImg" id="characterProfilImg"> (Le format doit être exactment de 400 x 500 px et en ".jpg")

    <br />
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="profil-img">
    <input type="submit" value="Modifier" />
</form>
