<h2>Liste des lieux</h2>

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>Status</td>
		</tr>
	</thead>

	{foreach from=$PlacesArray item=Place}
		<tr>
			<td>{$Place->name}</td>
			<td>
                {if $Place->status['id'] == 1}
                    Pays
                {elseif $Place->status['id'] == 2}
                    Ville
                {elseif $Place->status['id'] == 3}
                    Village
                {elseif $Place->status['id'] == 4}
                    Lieu
				{elseif $Place->status['id'] == 5}
                    Montagne
                {/if}
            </td>
            <td>
                <a href="update-place.php?id={$Place->id}" class="update-link">
                    modifier
                </a>
            </td>
		</tr>
	{/foreach}
</table>
