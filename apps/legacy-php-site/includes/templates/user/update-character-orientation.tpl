<h1>Modification de l'orientation du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Orientation :
    <select name="orientationId">
        {foreach from=$orientationsArray key=k item=orientation}
            <option value="{$orientation['id']}" {if $orientation['id'] == $Character->orientation['id']}selected{/if}>{$orientation['name']}</option>
        {/foreach}
    </select>

    <br />
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="orientation">
    <input type="submit" value="Modifier" />
</form>
