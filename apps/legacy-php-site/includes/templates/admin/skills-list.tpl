<h2>Liste des compétences</h2>

{foreach from=$skillsArray key=k item=skillsFamilyArray}
    <h3>{$skillsFamilyArray['0']['familyName']}</h3>

    {foreach from=$skillsFamilyArray key=k item=skill}
        {for $i=1 to $skill['level']}
            &nbsp;&nbsp;&nbsp;&nbsp;
        {/for}

        {$skill['name']} &nbsp;&nbsp;&nbsp; <a href="update-skill.php?id={$skill['id']}" class="update-link">modifier</a>

        <br />
    {/foreach}
{/foreach}
