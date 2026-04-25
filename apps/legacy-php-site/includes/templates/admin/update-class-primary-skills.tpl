<h1>Ajout de compétences primaires à une classe</h1>

<h2>Classe : {$classArray['name']}</h2>

<form action="update-class-primary-skills.php?id={$classArray['id']}" method="post" class="form">
    {foreach from=$primarySkills item=skill}
        {$skill['name']}

        <input type="checkbox" name="{$skill['id']}"
            {foreach from=$classArray['primarySkillsArray'] item=primarySkill}
                {if $primarySkill['id'] == $skill['id']}checked{/if}
            {/foreach}
        >

        <br />
    {/foreach}

    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Modifier" />
</form>
