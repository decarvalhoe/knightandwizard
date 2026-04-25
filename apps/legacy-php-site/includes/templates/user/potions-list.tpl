<h1>Les potions</h1>

<form action="potions-list.php" method="get" class="form">
	Tri par :

    <select name="order">
		<option value="name">nom</option>
		<option value="difficulty">difficulté</option>
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
			<th>Ingrédients</th>
			<th>Recette</th>
			<th>Difficulté</th>
			<th>Valeur</th>
		</tr>
	</thead>

	{foreach from=$potionsArray item=potion}
		<tr>
			<td>{$potion['name']}</td>
            <td>{$potion['effect']}</td>
			<td>{$potion['ingredients']}</td>
			<td>{$potion['recipe']}</td>
			<td>{$potion['difficulty']}</td>
			<td>{$potion['value']}</td>
		</tr>
	{/foreach}
</table>
