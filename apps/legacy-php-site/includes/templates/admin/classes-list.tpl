<h2>Liste des classes</h2>

{foreach from=$classesArray item=orientation}
    <h3>{$orientation['name']}</h3>

    <table>
    	<thead>
    		<tr>
    			<td>Nom</td>
    			<td>Atout</td>
    			<td>Compétence primaire</td>
    		</tr>
    	</thead>

    	{foreach from=$orientation['classes'] item=class}
    		<tr>
    			<td>{$class['name']} <a href="update-class.php?id={$class['id']}" class="update-link">modifier</a></td>
    			<td>{$class['asset']['name']} <a href="update-class-asset.php?id={$class['id']}" class="update-link">modifier</a></td>
                <td>
                    {foreach from=$class['primarySkillsArray'] item=primarySkill}
                        {$primarySkill['name']} 
                    {/foreach}

                    <a href="update-class-primary-skills.php?id={$class['id']}" class="update-link">
                        modifier
                    </a>
                </td>
    		</tr>
    	{/foreach}
    </table>
{/foreach}
