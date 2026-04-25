<h1>Modification du genre du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Genre :
    <select name="genderId">
        {foreach from=$gendersArray key=k item=gender}
            <option value="{$gender['id']}" {if $gender['id'] == $Character->gender['id']}selected{/if}>{$gender['name']}</option>
        {/foreach}
    </select>

    <br />
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="gender">
    <input type="submit" value="Modifier" />
</form>
