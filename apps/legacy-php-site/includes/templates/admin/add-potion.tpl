<h1>Ajouter une potion</h1>

<form action="add-potion.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect"></textarea>

    <br /><br />

    Ingrédients : <textarea rows="4" cols="50" name="ingredients"></textarea>

    <br /><br />

    Recette : <textarea rows="4" cols="50" name="recipe"></textarea>

    <br /><br />

    Value : <input type="number" name="value" min="1">

    <br /><br />

    <input type="hidden" name="filled-field" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
