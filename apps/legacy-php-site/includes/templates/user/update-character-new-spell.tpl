<h2>Nouveau sort</h2>

<form action="update-character.php?update=done" method="post" class="form">
    <table class="spells-table">
        <tr>
            <td>Nom</td>
			<td>Type</td>
            <td>Energie</td>
            <td>TI</td>
            <td>Diff.</td>
            <td>Effet</td>
        </tr>

        {foreach from=$spellsArray key=k item=spell}
            <tr class="magic-spell-type-id-{$spell['typeId']}">
                <td>{$spell['name']} : <input type="number" class="table-spell-input" name="{$spell['id']}" value="0" min="0"></td>
                <td>
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
                <td>{$spell['energy']}</td>
                <td>{$spell['castingTime']}</td>
                <td>{$spell['difficulty']}</td>
                <td>{$spell['effect']}</td>
            </tr>
        {/foreach}
    </table>

    <br /><br />

    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="new-spell">
    <input type="submit" value="Terminer" />
</form>
