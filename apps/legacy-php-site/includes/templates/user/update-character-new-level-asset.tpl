<h2>Nouvel atout</h2>

{$k = 1}

<form action="update-character.php?update=done" method="post" class="form">
    {while $k++ < $levelMax}
    	<h2>Niveau {$k}</h2>

        <table>
        	<thead>
        		<tr>
        			<td></td>
        			<td>Nom</td>
                    <td>Race</td>
                    <td>Orientation</td>
    				<td>Classe</td>
    				<td>Conditions spéciales</td>
    				<td>Effet</td>
        		</tr>
        	</thead>

        	{foreach from=$levelAssetsArray item=levelAsset}
                {if $levelAsset['level'] == $k}
            		<tr>
            			<td><input type="radio" name="asset-merge-level-id" value="{$levelAsset['assetMergeLevelId']}"/></td>
            			<td>
                            {$levelAsset['name']}

                            {if $levelAsset['unitId'] == 2 || $levelAsset['unitId'] == 3}
                                : {$levelAsset['points']}{if $levelAsset['unitId'] == 3}%{/if}
                            {/if}
                        </td>
                        <td>{$levelAsset['race']}</td>
                        <td>{$levelAsset['orientation']}</td>
                        <td>{$levelAsset['class']}</td>
                        <td>{$levelAsset['specialCondition']}</td>
                        <td>{$levelAsset['effect']}</td>
            		</tr>
                {/if}
        	{/foreach}
        </table>

        <br />
    {/while}

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="new-level-asset">
    <input type="submit" value="Ajouter" />
</form>
