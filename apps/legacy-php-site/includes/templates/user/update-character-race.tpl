<h1>Modification de la race du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Race :
    <select name="raceId">
        {foreach from=$racesArray key=k item=race}
            <option value="{$race['id']}" {if $race['id'] == $Character->race['id']}selected{/if}>{$race['name']}</option>
        {/foreach}
    </select>

    <br />
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="race">
    <input type="submit" value="Modifier" />
</form>
