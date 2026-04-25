<h1>Ajouter un atout</h1>

<form action="add-asset.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect"></textarea>

    <br /><br />

    Activation :
    <select name="activation">
        <option value="0">Permanent</option>
        <option value="1">Ephémère</option>
    </select>

    <br /><br />

    Unité :
    <select name="unit-id">
        <option value="1">Aucune</option>
        <option value="2">Point</option>
        <option value="3">%</option>
        <option value="4">Niveau</option>
    </select>

    <br /><br />

    Valeur : <input type="number" name="value">

    <br /><br />

    <input type="checkbox" name="is-orientation-asset" value="TRUE"> Atout d'orientation

    <br />

    Orientation :
    <select name="orientation-id">
        <option value="">Aucune</option>

        {foreach from=$orientationsArray key=k item=orientation}
            <option value="{$orientation['id']}">{$orientation['name']}</option>
        {/foreach}
    </select>

    <br />
    <br />

    <input type="checkbox" name="is-class-asset" value="TRUE"> Atout de classe

    <br />

    Classe :
    <select name="class-id">
        <option value="">Aucune</option>

        {foreach from=$classesArray key=k item=class}
            <option value="{$class['id']}">{$class['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
