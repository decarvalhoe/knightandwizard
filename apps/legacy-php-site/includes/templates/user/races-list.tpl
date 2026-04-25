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

<table id="races-list">
	<thead>
		<tr>
			<th style="width: 65px;">Nom</th>
			<th style="width: 63px;">Catégorie</th>
			<th style="width: 49px;">Vitalité</th>
			<th style="width: 47px;">F. Vitesse</th>
			<th style="width: 51px;">F. Volonté</th>
			<th style="width: 36px;">Force max</th>
			<th style="width: 61px;">Dextérité max</th>
			<th style="width: 70px;">Endurance max</th>
			<th style="width: 71px;">Esthétisme max</th>
			<th style="width: 63px;">Charisme max</th>
			<th style="width: 63px;">Empathie max</th>
			<th style="width: 78px;">Intelligence max</th>
			<th style="width: 70px;">Perception max</th>
			<th style="width: 54px;">Reflexes max</th>
			<th style="width: 182px;">Atouts</th>
		</tr>
	</thead>

	<tbody>
		{foreach from=$racesArray item=race}
			<tr>
				<td class="text-cell">{$race['name']}</td>
				<td class="num-cell" style="text-align: center;">{$race['category']}</td>
				<td class="num-cell" style="text-align: center;">{$race['vitality']}</td>
				<td class="num-cell" style="text-align: center;">{$race['speedFactor']}</td>
				<td class="num-cell" style="text-align: center;">{$race['willFactor']}</td>
				<td class="num-cell" style="text-align: center;">{$race['strengthMax']}</td>
				<td class="num-cell" style="text-align: center;">{$race['dexterityMax']}</td>
				<td class="num-cell" style="text-align: center;">{$race['staminaMax']}</td>
				<td class="num-cell" style="text-align: center;">{$race['aestheticismMax']}</td>
				<td class="num-cell" style="text-align: center;">{$race['charismaMax']}</td>
				<td class="num-cell" style="text-align: center;">{$race['empathyMax']}</td>
				<td class="num-cell" style="text-align: center;">{$race['intelligenceMax']}</td>
				<td class="num-cell" style="text-align: center;">{$race['perceptionMax']}</td>
				<td class="num-cell" style="text-align: center;">{$race['reflexesMax']}</td>
				<td class="text-cell">
					{foreach $race['assets'] key=k item=asset}
						{if $k > 0}
							<br />
						{/if}

						{$asset['name']}
					{/foreach}
				</td>
			</tr>
		{/foreach}
	</tbody>
</table>

<table id="header-fixed"></table>

{literal}
	<script language=javascript>
		var tableOffset = $("#races-list").offset().top;
		var $header = $("#races-list > thead").clone();
		var $fixedHeader = $("#header-fixed").append($header);

		$(window).bind("scroll", function() {
		    var offset = $(this).scrollTop();

		    if (offset >= tableOffset && $fixedHeader.is(":hidden")) {
		        $fixedHeader.show();
		    }
		    else if (offset < tableOffset) {
		        $fixedHeader.hide();
		    }
		});
    </script>
{/literal}
