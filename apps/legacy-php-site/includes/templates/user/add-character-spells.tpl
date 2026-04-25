<h2>Sorts</h2>

<form action="add-character.php" method="post" class="form">
    <table>
    	<thead>
    		<tr>
    			<td>Nom</td>
    			<td>Type</td>
                <td>Energie</td>
                <td>TI</td>
                <td>Diff.</td>
                <td>Effet</td>
    			<td>Valeur</td>
    		</tr>
    	</thead>

    	{foreach from=$spellsArray item=spell}
    		<tr class="magic-spell-type-id-{$spell['typeId']}">
                <td>{$spell['name']} : <input type="number" class="table-spell-input" name="{$spell['id']}" value="0" min="0"></td>
                <td>
    				{if $spell['typeId'] == 1}
    					Abjuration
    				{elseif $spell['typeId'] == 2}
    					Altération
    				{elseif $spell['typeId'] == 3}
    					Blanche
    				{elseif $spell['typeId'] == 4}
    					Divinatoire
    				{elseif $spell['typeId'] == 5}
    					Elémentaire
    				{elseif $spell['typeId'] == 6}
    					Enchantement
    				{elseif $spell['typeId'] == 7}
    					Illusion
    				{elseif $spell['typeId'] == 8}
    					Invocation
    				{elseif $spell['typeId'] == 9}
    					Naturelle
    				{elseif $spell['typeId'] == 10}
    					Nécromancie
    				{elseif $spell['typeId'] == 11}
    					Noire
    				{/if}
    			</td>
                <td>{$spell['energy']}</td>
                <td>{$spell['castingTime']}</td>
                <td>{$spell['difficulty']}</td>
                <td>{$spell['effect']}</td>
    			<td>{$spell['value']}</td>
    		</tr>
    	{/foreach}
    </table>

    <br />

    <input type="checkbox" name="random" value="TRUE"> Aléatoire | Niveau : <input type="number" name="level" value="{$level}" min="1">

    <br /><br />

    <input type="hidden" name="step" value="{$step}">
    <input type="submit" value="Suivant" />
</form>
