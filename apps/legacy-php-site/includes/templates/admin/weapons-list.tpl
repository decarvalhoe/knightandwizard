<h1>Armes</h1>

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>D&eacute;g&acirc;ts</td>
			<td>Type</td>
			<td>Diff.</td>
			<td>Poids</td>
			<td>Sp&eacute;cial</td>
		</tr>
	</thead>

	{foreach from=$weaponsListArray item=Weapon}
		<tr>
			<td>{$Weapon->name}</td>
			<td>
				{if $Weapon->useStrength == 1}
					F+{$Weapon->dammage}
				{else}
					{$Weapon->dammage}
				{/if}
			</td>
			<td>{$Weapon->dammageType}</td>
			<td>{$Weapon->difficulty}</td>
			<td>{$Weapon->weight}</td>
			<td>{$Weapon->special}</td>
		</tr>
	{/foreach}
</table>
