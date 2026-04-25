<h1>Modification de compétence</h1>

<form action="update-character.php?update=done" method="post" class="form">

    {$skillArray['name']} : <input type="number" name="skill-points" value="{$skillArray['points']}" min="0">

    {if $skillArray['isChildOf'] == 0 && $Character->orientation['id'] != 1}
        <br /><br />

        <input type="checkbox" name="isMain" {if $skillArray['isMain'] == 1}checked{/if} value="1"> Compétence primaire
    {/if}

    <br /><br />

    <input type="hidden" name="skill-id" value="{$skillArray['id']}">
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="skill">
    <input type="submit" value="Modifier" />
</form>
