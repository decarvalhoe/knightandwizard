<h1>Le Grand Grimoire</h1>

<form action="spells-list.php" method="get" class="form">
	Tri par :

    <select name="order">
		<option value="name">nom</option>
		<option value="type_id">type de magie</option>
		<option value="energy">énergie</option>
		<option value="casting_time">TI</option>
		<option value="difficulty">difficulté</option>
        <option value="value">valeur</option>
    </select>

    <input type="submit" value="Trier" />
</form>

<br />

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

	{foreach from=$spellsListArray item=spell}
		<tr class="magic-spell-type-id-{$spell['typeId']}">
			<td>{$spell['name']}</td>
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
			<td><a href="update-spell.php?id={$spell['id']}">Modifier</a></td>
		</tr>
	{/foreach}
</table>
