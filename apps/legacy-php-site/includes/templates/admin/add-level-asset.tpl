<h1>Ajouter un atout de niveau {$level}</h1>

<form action="add-level-asset.php?level={$level}" method="post" class="form">
    Atout :
    <select name="asset-id">
        <option value="">Aucun</option>

        {foreach from=$assetsArray key=k item=asset}
            <option value="{$asset['id']}">{$asset['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Points : <input type="number" name="points">

    <br /><br />

    Réservé à la race :

    <select name="race-id">
        <option value="">Aucune</option>

        {foreach from=$racesArray key=k item=race}
            <option value="{$race['id']}">{$race['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Réservé à l'orientation :
    <select name="orientation-id">
        <option value="">Aucune</option>

        {foreach from=$orientationsArray key=k item=orientation}
            <option value="{$orientation['id']}">{$orientation['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Réservé à la classe :

    <select name="class-id">
        <option value="">Aucune</option>

        {foreach from=$classesArray key=k item=class}
            <option value="{$class['id']}">{$class['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Condition spéciale :<br />
    <textarea rows="4" cols="50" name="special-condition"></textarea>


    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
