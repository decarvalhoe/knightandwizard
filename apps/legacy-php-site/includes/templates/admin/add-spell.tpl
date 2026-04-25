<h1>Ajouter un sort</h1>

<form action="add-spell.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect"></textarea>

    <br /><br />

    Type :
    <select name="type-id">
        <option value="1">Abjuration</option>
        <option value="2">Altération</option>
        <option value="3">Blanche</option>
        <option value="4">Divinatoire</option>
        <option value="5">Elémentaire</option>
        <option value="6">Enchantement</option>
        <option value="7">Illusion</option>
        <option value="8">Invocation</option>
        <option value="9">Naturelle</option>
        <option value="10">Nécromancie</option>
        <option value="11">Noire</option>
    </select>

    <br /><br />

    Value : <input type="number" name="value" min="1">

    <br /><br />

    <input type="hidden" name="filled-field" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
