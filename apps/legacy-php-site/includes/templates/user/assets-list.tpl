<h2>Liste d'atouts</h2>

<a href="levels-assets-list.php">Atouts de niveaux</a>

<br />
<br />

<form action="assets-list.php" method="get" class="form">
	Tri par :

    <select name="order">
		<option value="name">nom</option>
        <option value="value">valeur</option>
    </select>

    <input type="submit" value="Trier" />
</form>

<br />

<table>
	<thead>
		<tr>
			<th>Nom</th>
			<th>Effet</th>
			<th>Valeur</th>
			<th>Activation</th>
			<th>Type</th>
		</tr>
	</thead>

	{foreach from=$assetsArray item=asset}
		<tr>
			<td>{$asset['name']}</td>
			<td>{$asset['effect']}</td>
            <td>{$asset['value']}</td>
			<td>{$asset['activation']}</td>
			<td>
				{if $asset['isOrientationAsset'] == 1}
					Orientation
				{elseif $asset['isClassAsset'] == 1}
					Classe
				{else}
					Neutre
				{/if}
			</td>
		</tr>
	{/foreach}
</table>
