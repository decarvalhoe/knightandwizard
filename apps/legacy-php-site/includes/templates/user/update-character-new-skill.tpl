<h2>Nouvelle compétences</h2>

<form action="update-character.php?update=done" method="post" class="form">
    {foreach from=$skillsArray key=k item=skillsFamilyArray}
        <h3>{$skillsFamilyArray['0']['familyName']}</h3>

        {foreach from=$skillsFamilyArray key=k item=skill}
            {if $skill['isChildOf'] == ''}
                <div class="add-character-skills-skill">
            {else}
                <div class="add-character-skills-specialisation">
            {/if}
                {$skill['name']} : <input type="number" name="{$skill['id']}" value="0" min="0"><br />
            </div>
        {/foreach}
    {/foreach}

    <br /><br />

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="new-skill">
    <input type="submit" value="Terminer" />
</form>
