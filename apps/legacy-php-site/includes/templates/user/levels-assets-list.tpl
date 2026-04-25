<h1>Atouts de niveaux</h1>

{$k = 1}

{while $k++ < $levelMax}
	<h2>Niveau {$k}</h2>

	<table>
		<thead>
			<tr>
				<td>Nom</td>
				<td>Race</td>
				<td>Orientation</td>
				<td>Classe</td>
				<td>Conditions spéciales</td>
				<td>Effet</td>
			</tr>
		</thead>

		{foreach from=$levelsAssetsArray item=levelAsset}
			{if $levelAsset['level'] == $k}
				<tr>
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
{/while}
