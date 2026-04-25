<h2>Bestiaire</h2>

<form action="races-list.php" method="get" class="form">
	Tri par :

    <select name="order">
		<option value="category" {if $order == category}selected{/if}>catégorie</option>
		<option value="name" {if $order == name}selected{/if}>nom</option>
		<option value="vitality" {if $order == vitality}selected{/if}>vitalité</option>
		<option value="speed_factor" {if $order == speed_factor}selected{/if}>F. vitesse</option>
		<option value="will_factor" {if $order == will_factor}selected{/if}>F. volonté</option>
		<option value="strength_max" {if $order == strength_max}selected{/if}>force max.</option>
		<option value="dexterity_max" {if $order == dexterity_max}selected{/if}>dextérité max.</option>
		<option value="stamina_max" {if $order == stamina_max}selected{/if}>endurance max.</option>
		<option value="aestheticism_max" {if $order == aestheticism_max}selected{/if}>esthétisme max.</option>
		<option value="reflexes_max" {if $order == reflexes_max}selected{/if}>reflexes max.</option>
		<option value="charisma_max" {if $order == charisma_max}selected{/if}>charisme max.</option>
		<option value="empathy_max" {if $order == empathy_max}selected{/if}>empathie max.</option>
		<option value="intelligence_max" {if $order == intelligence_max}selected{/if}>intelligence max.</option>
		<option value="perception_max" {if $order == perception_max}selected{/if}>perception max.</option>
    </select>

    <input type="submit" value="Trier" />
</form>

<br />

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>Catégorie</td>
			<td>Vitalité</td>
			<td>F. Vitesse</td>
			<td>F. Volonté</td>
			<td>Force max</td>
			<td>Dextérité max</td>
			<td>Endurance max</td>
			<td>Esthétisme max</td>
			<td>Charisme max</td>
			<td>Empathie max</td>
			<td>Intelligence max</td>
			<td>Perception max</td>
			<td>Reflexes max</td>
			<td>Atouts</td>
		</tr>
	</thead>

	{foreach from=$racesArray item=race}
		<tr>
			<td class="text-cell">{$race['name']}</td>
			<td class="num-cell">{$race['category']}</td>
			<td class="num-cell">{$race['vitality']}</td>
			<td class="num-cell">{$race['speedFactor']}</td>
			<td class="num-cell">{$race['willFactor']}</td>
			<td class="num-cell">{$race['strengthMax']}</td>
			<td class="num-cell">{$race['dexterityMax']}</td>
			<td class="num-cell">{$race['staminaMax']}</td>
			<td class="num-cell">{$race['aestheticismMax']}</td>
			<td class="num-cell">{$race['charismaMax']}</td>
			<td class="num-cell">{$race['empathyMax']}</td>
			<td class="num-cell">{$race['intelligenceMax']}</td>
			<td class="num-cell">{$race['perceptionMax']}</td>
			<td class="num-cell">{$race['reflexesMax']}</td>
			<td class="text-cell">
				{foreach $race['assets'] key=k item=asset}
					{if $k > 0}
						,&nbsp;
					{/if}

					{$asset['name']}

					{if $asset['unitId'] == 2}
						{$asset['points']}
					{elseif $asset['unitId'] == 3}
						{$asset['points']} %
					{/if}
				{/foreach}
			</td>
			<td><a href="update-race.php?id={$race['id']}">Modifier</a></td>
		</tr>
	{/foreach}
</table>
