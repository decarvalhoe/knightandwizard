<h2>Nouvel atout</h2>

<form action="update-character.php?update=done" method="post" class="form">
    <table>
    	<thead>
    		<tr>
    			<td></td>
    			<td>Nom</td>
                <td>Points</td>
				<td>Effet</td>
                <td>Activation</td>
				<td>Valeur</td>
    		</tr>
    	</thead>

    	{foreach from=$assetsArray item=asset}
    		<tr>
    			<td><input type="radio" name="asset-id" value="{$asset['id']}"/></td>
    			<td>{$asset['name']}</td>
    			<td>
                    {if $asset['unitId'] == 2 || $asset['unitId'] == 3}
                        <input type="number" name="{$asset['id']}-points" value="0" min="0">
                        {if $asset['unitId'] == 3}%{/if}
                    {/if}
                </td>
                <td>{$asset['effect']}</td>
                <td>{$asset['activation']}</td>
                <td>{$asset['value']}</td>
    		</tr>
    	{/foreach}
    </table>

    <br />

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="new-asset">
    <input type="submit" value="Ajouter" />
</form>
