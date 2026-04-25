<h1>Modification de l'orientation du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Classe :
    <select name="classId">
        {foreach from=$classesArray key=k item=class}
            <option value="{$class['id']}" {if $class['id'] == $Character->class['id']}selected{/if}>{$class['name']}</option>
        {/foreach}
    </select>

    <br />
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="class">
    <input type="submit" value="Modifier" />
</form>
