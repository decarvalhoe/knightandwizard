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

<table id="spells-list">
	<thead>
		<tr>
			<th style="width: 178px;">Nom</th>
			<th style="width: 97px;">Type</th>
            <th style="width: 50px;">Energie</th>
            <th style="width: 28px;">TI</th>
            <th style="width: 32px;">Diff.</th>
            <th style="width: 595px;">Effet</th>
			<th style="width: 43px;">Valeur</th>
		</tr>
	</thead>

	<tbody>
		{foreach from=$spellsListArray item=spell}
			<tr class="magic-spell-type-id-{$spell['typeId']}">
				<td>{$spell['name']}</td>
	            <td style="text-align: center;">
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
	            <td style="text-align: center;">{$spell['energy']}</td>
	            <td style="text-align: center;">{$spell['castingTime']}</td>
	            <td style="text-align: center;">{$spell['difficulty']}</td>
	            <td>{$spell['effect']}</td>
				<td style="text-align: center;">{$spell['value']}</td>
			</tr>
		{/foreach}
	</tbody>
</table>

<table id="header-fixed"></table>

{literal}
	<script language=javascript>
		var tableOffset = $("#spells-list").offset().top;
		var $header = $("#spells-list > thead").clone();
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
