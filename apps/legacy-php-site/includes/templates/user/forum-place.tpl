{foreach from=$forumPlacesArray key=i item=place}
    {if $place['id'] == $placeId}
        <h1>{$place['name']}</h1>
    {/if}
{/foreach}

Personnages présents :

<br />

{foreach from=$PresentCharractersArray key=k item=Character}
    <img src="{$Character->profilImg}" height="100" width="80">
{/foreach}

<br /><br />

<form action="forum.php?place-id={$placeId}&page=1&action=place-character" method="post" class="form">
    Inclure un personnage :

    <select name="characterId">
        {foreach from=$CharactersArray key=k item=Character}
            {if $Character->place['id'] != $placeId}
                <option value="{$Character->id}">{$Character->name}</option>
            {/if}
        {/foreach}
    </select>

    <input type="submit" value="Entrez" />
</form>

<br />
