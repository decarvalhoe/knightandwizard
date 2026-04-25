<h1>Modifier un atout</h1>

<form action="update-asset.php?id={$assetArray['id']}" method="post" class="form">
    Nom : <input type="text" name="name" value="{$assetArray['name']}">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect">{$assetArray['effect']}</textarea>

    <br /><br />

    Activation :
    <select name="activation">
        <option value="0" {if $assetArray['activation'] == 0}selected{/if}>Permanent</option>
        <option value="1" {if $assetArray['activation'] == 1}selected{/if}>Ephémère</option>
    </select>

    <br /><br />

    Unité :
    <select name="unit-id">
        <option value="1" {if $assetArray['unitId'] == 1}selected{/if}>Aucune</option>
        <option value="2" {if $assetArray['unitId'] == 2}selected{/if}>Point</option>
        <option value="3" {if $assetArray['unitId'] == 3}selected{/if}>%</option>
        <option value="4" {if $assetArray['unitId'] == 4}selected{/if}>Niveau</option>
    </select>

    <br /><br />

    Valeur : <input type="number" name="value" value="{$assetArray['value']}">

    <br /><br />

    <input type="checkbox" name="is-orientation-asset" value="TRUE" {if $assetArray['isOrientationAsset'] == 1}checked{/if}> Atout d'orientation

    <br />

    <input type="checkbox" name="is-class-asset" value="TRUE" {if $assetArray['isClassAsset'] == 1}checked{/if}> Atout de classe

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
