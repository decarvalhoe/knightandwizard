<h1>Modifier un lieu</h1>

<form action="update-place.php?id={$placeArray['id']}" method="post" class="form">
    Nom : <input type="text" name="name" value="{$placeArray['name']}">

    <br /><br />

    Inclus dans:
    <select name="is-child-of">
        <option value="0" {if $placeArray['isChildOf'] == 0}selected{/if}>Aucun</option>

        {foreach from=$placesArray item=place}
            <option value="{$place['id']}" {if $placeArray['isChildOf'] == $place['id']}selected{/if}>{$place['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Status:
    <select name="status-id">
        {foreach from=$placesStatusArray item=status}
            <option value="{$status['id']}" {if $placeArray['statusId'] == $status['id']}selected{/if}>{$status['name']}</option>
        {/foreach}
    </select>

    <br /><br />

    Capitale :
    <input type="radio" name="is-capital" value="1" {if $placeArray['isCapital'] == 1}checked{/if}> Oui
    &nbsp;
    <input type="radio" name="is-capital" value="0" {if $placeArray['isCapital'] == 0}checked{/if}> Non<br>

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
