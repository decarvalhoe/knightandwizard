<h2>Race</h2>

<form action="add-character.php" method="post" class="form">
    <div class="add-character-race-left-col">
        <select id="add-character-selectbox-race" name="raceId">
            {foreach from=$racesArray key=k item=race}
                <option value="{$race['id']}">{$race['name']}</option>
            {/foreach}
        </select>
    </div>

    <div class="add-character-race-right-col">
        {foreach from=$racesArray key=k item=race}
            {if $k != 0}
                <div id="display-race-{$race['id']}" style="display:none;">
                    <h3>Atouts de race</h3>

                    {foreach from=$race['assets'] item=asset}
                        {$asset['name']}

                        {if $asset['unitId'] == 2}
    						: {$asset['points']}
    					{elseif $asset['unitId'] == 3}
    						{$asset['points']} %
    					{/if}

                        <br />
                    {/foreach}
                </div>
            {/if}
        {/foreach}
    </div>

    <br /><br />

    <input type="hidden" name="step" value="{$step}">
    <input type="submit" value="Suivant" />
</form>

{literal}
    <script language=javascript>
        var race_id = 0;
        var selectbox = document.getElementById("add-character-selectbox-race");

        function display_race() {
            if(race_id != 0){
                document.getElementById("display-race-" + race_id).style.display = "none";
            }

            race_id = selectbox.options[selectbox.selectedIndex].value;
            var race_name = selectbox.options[selectbox.selectedIndex].text;

            if(race_name != 'Aléatoire'){
                document.getElementById("display-race-" + race_id).style.display = "block";
            }
        }

        window.onload = display_race;
        document.getElementById("add-character-selectbox-race").addEventListener('change', display_race);
    </script>
{/literal}
