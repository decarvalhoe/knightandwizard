<h2>Compétences</h2>

<form action="add-character.php" method="post" class="form">
    {foreach from=$skillsArray key=k item=skillsFamilyArray}
        <h3>{$skillsFamilyArray['0']['familyName']}</h3>

        <table>
        	<thead>
        		<tr>
        			<td>Prim.</td>
        			<td>Compétence</td>
        			<td>Points</td>
        		</tr>
        	</thead>

        	{foreach from=$skillsFamilyArray key=k item=skill}
        		<tr>
        			<td>
                        {if $skill['isChildOf'] == '0'}
                            <input type="radio" name="mainSkill" value="{$skill['id']}"/>
                        {/if}
                    </td>

        			<td>
                        {if $skill['isChildOf'] == ''}
                            <div class="add-character-skills-skill">
                        {else}
                            <div class="add-character-skills-specialisation">
                        {/if}
                            {$skill['name']}
                        </div>
                    </td>

        			<td>
                        <input type="number" name="{$skill['id']}" value="0" min="0">
                    </td>
        		</tr>
        	{/foreach}
        </table>
    {/foreach}

    <br />

    <input type="checkbox" name="random" value="TRUE"> Aléatoire | Niveau : <input type="number" name="level" value="{$level}" min="1">

    <br /><br />

    <input type="hidden" name="step" value="{$step}">
    <input type="submit" value="Suivant" />
</form>
