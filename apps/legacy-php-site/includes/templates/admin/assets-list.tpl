<h2>Liste d'atouts</h2>

<a href="levels-assets-list.php">Atouts de niveaux</a>

<br /><br />

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>Effet</td>
			<td>Valeur</td>
			<td>Activation</td>
		</tr>
	</thead>

	{foreach from=$assetsArray item=asset}
		<tr>
			<td>{$asset['name']}</td>
			<td>{$asset['effect']}</td>
			<td>{$asset['value']}</td>
            <td>{$asset['activation']}</td>
			<td><a href="update-asset.php?id={$asset['id']}">Modifier</a></td>
		</tr>
	{/foreach}
</table>
