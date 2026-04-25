<h1>Modifier une compétence</h1>

<form action="update-skill.php?id={$skillArray['id']}" method="post" class="form">
    Nom : <input type="text" name="name" value="{$skillArray['name']}"><br />

    Famille :
    <select name="skillFamilyId">
        {foreach from=$skillsFamiliesArray key=k item=skillsFamily}
            <option value="{$skillsFamily['id']}" {if $skillArray['familyId'] == $skillsFamily['id']}selected{/if}>{$skillsFamily['name']}</option>
        {/foreach}
    </select><br />

    Spécialisation de :
    <select name="childOfId">
        <option value="">Aucune</option>

        {foreach from=$skillsArray key=k item=skill}
            <option value="{$skill['id']}" {if $skillArray['isChildOf'] == $skill['id']}selected{/if}>{$skill['name']}</option>
        {/foreach}
    </select>



    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
