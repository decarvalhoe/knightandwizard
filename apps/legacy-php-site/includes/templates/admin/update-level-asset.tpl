<h1>Modifier un atout de niveau</h1>

<form action="update-level-asset.php?id={$assetMergeLevelArray['id']}" method="post" class="form">
    <p>
        <b>Nom :</b>
        <br />
        {$assetArray['name']}
    </p>

    <p>
        <b>Effet :</b>
        <br />
        {$assetArray['effect']}
    </p>

    <p>
        <b>Activation :</b>
        <br />
        {if $assetArray['activation'] == 0}
            Permanent
        {else}
            Ephémère
        {/if}
    </p>

    <p>
        <b>Unité :</b>
        <br />
        {if $assetArray['unitId'] == 1}
            Aucune
        {elseif $assetArray['unitId'] == 2}
            Point
        {elseif $assetArray['unitId'] == 3}
            %
        {elseif $assetArray['unitId'] == 4}
            Niveau
        {/if}
    </p>

    <p>
        <b>Valeur : </b>
        <br />
        {$assetArray['value']}
    </p>

    Niveau :


    <select name="level">
        {$k = 1}

        {while $k++ < $levelMax}
            <option value="{$k}" {if $assetMergeLevelArray['level'] == $k}selected{/if}>{$k}</option>
        {/while}
    </select>

    <br /><br />

    Points : <input type="number" name="points" value="{$assetMergeLevelArray['points']}">

    <br /><br />

    Réservé à la race :

    <select name="race-id">
        <option value="">Aucune</option>

        {foreach from=$racesArray key=k item=race}
            <option value="{$race['id']}" {if $assetMergeLevelArray['raceId'] == $race['id']}selected{/if}>{$race['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Réservé à l'orientation :
    <select name="orientation-id">
        <option value="">Aucune</option>

        {foreach from=$orientationsArray key=k item=orientation}
            <option value="{$orientation['id']}" {if $assetMergeLevelArray['orientationId'] == $orientation['id']}selected{/if}>{$orientation['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Réservé à la classe :

    <select name="class-id">
        <option value="">Aucune</option>

        {foreach from=$classesArray key=k item=class}
            <option value="{$class['id']}" {if $assetMergeLevelArray['classId'] == $class['id']}selected{/if}>{$class['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Condition spéciale :<br />
    <textarea rows="4" cols="50" name="special-condition">{$assetMergeLevelArray['specialCondition']}</textarea>

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
