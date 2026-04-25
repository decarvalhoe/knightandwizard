<h1>Ajouter une arme</h1>

<form action="add-weapon.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Dommage : <input type="number" name="dammage" min="0">

    <br /><br />

    Jet de force :

    <select name="use-strength">
        <option value="1">Oui</option>
        <option value="0">Non</option>
    </select>

    <br /><br />

    Type de dégâts :

    <select name="dammage-type">
        <option value="P">Perforant</option>
        <option value="E">Energie</option>
        <option value="C">Contondant</option>
        <option value="T">Tranchant</option>
    </select>

    <br /><br />

    Difficulté : <input type="number" name="difficulty" min="1">

    <br /><br />

    Poids : <input type="number" name="weight" min="0" step="0.01"> (ex. 1, 1.2, 1.9, ...)

    <br /><br />

    Spécial : <textarea rows="4" cols="50" name="special"></textarea>

    <br /><br />

    <input type="hidden" name="filled-field" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
