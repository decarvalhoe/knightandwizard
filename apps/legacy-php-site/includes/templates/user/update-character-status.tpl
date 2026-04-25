<h1>Modification du status du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Status :
    <select name="status-id">
        {foreach from=$statusArray key=k item=status}
            <option value="{$status['id']}" {if $status['id'] == $Character->status['id']}selected{/if}>{$status['name']}</option>
        {/foreach}
    </select>

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="status">
    <input type="submit" value="Modifier" />
</form>
