<h1>Armes</h1>

<table id="weapons-list">
	<thead>
		<tr>
			<th style="width: 300px;">Nom</th>
			<th style="width: 50px;">D&eacute;g&acirc;ts</th>
            <th style="width: 50px;">Type</th>
            <th style="width: 50px;">Diff.</th>
            <th style="width: 50px;">Poids</th>
            <th style="width: 523px;">Sp&eacute;cial</th>
		</tr>
	</thead>

	<tbody>
		{foreach from=$weaponsListArray item=Weapon}
			<tr>
				<td>{$Weapon->name}</td>
				<td style="text-align: center;">
					{if $Weapon->useStrength == 1}
						{if $Weapon->dammage >= 1}
							F+{$Weapon->dammage}
						{else}
							F
						{/if}
					{else}
						{$Weapon->dammage}
					{/if}
				</td>
				<td style="text-align: center;">{$Weapon->dammageType}</td>
				<td style="text-align: center;">{$Weapon->difficulty}</td>
				<td style="text-align: center;">{$Weapon->weight}</td>
				<td>{$Weapon->special}</td>
			</tr>
		{/foreach}
	</tbody>
</table>

<table id="header-fixed"></table>

{literal}
	<script language=javascript>
		var tableOffset = $("#weapons-list").offset().top;
		var $header = $("#weapons-list > thead").clone();
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
