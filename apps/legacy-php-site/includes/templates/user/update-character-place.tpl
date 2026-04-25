<h1>Déplacer le personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Emplacement :
    <select name="placeId">
        <option value="0" {if $Character->place->id == 0}selected{/if}>Indisponible</option>

        {foreach from=$PlacesArray key=k item=Place}
            <option value="{$Place->id}" {if $Place->id == $Character->place->id}selected{/if}>{$Place->name}</option>
        {/foreach}
    </select>

    <br />
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="place">
    <input type="submit" value="Modifier" />
</form>
