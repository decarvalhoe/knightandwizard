<h2>Sélectionner un atouts de niveau {$levelProcessing}</h2>

{$k = 1}

<form action="add-character.php" method="post" class="form">
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
            			<td><input type="radio" name="levelAssetId" value="{$levelAsset['id']}"/></td>
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

    <input type="checkbox" name="random" value="TRUE"> Aléatoire

    <br /><br />

    <input type="hidden" name="step" value="{$step}">
    <input type="hidden" name="levelProcessing" value="{$levelProcessing}">
    <input type="submit" value="Suivant" />
</form>
