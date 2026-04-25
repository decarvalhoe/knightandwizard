<h1>Assistant de combat</h1>

<div id="TD-counter">
    <h2>DT</h2>

    <div id="TD-container">
        {$TD}
    </div>

    <div id="TD-buttons">
        <div class="left-button">
            <form action="fight-assistant.php" method="post" class="form">
                <input type="hidden" name="TD" value="{$TD}">
                <input type="hidden" name="nextTD" value="-">
                <input type="submit" value="Pr&eacute;c&eacute;dent" />
            </form>
        </div>

        <div>
            <form action="fight-assistant.php" method="post" class="form">
                <input type="hidden" name="TD" value="{$TD}">
                <input type="hidden" name="nextTD" value="+">
                <input type="submit" value="Suivant" />
            </form>
        </div>
    </div>
</div>

<h2>PNJ</h2>

<div id="add-npc-form">
    <form action="fight-assistant.php" method="post" class="form">
        PNJ commun :
        <select name="NpcId">
            {foreach from=$NpcAvailableArray item=npc}
                <option value="{$npc['id']}">{$npc['name']}</option>
            {/foreach}
        </select>

        <input type="number" name="nbrOfNewNpc" value="0" max="100">

        <input type="hidden" name="action" value="addNpc">
        <input type="hidden" name="TD" value="{$TD}">
        <input type="hidden" name="nextTD" value="">
        <input type="submit" value="Ajouter" />
    </form>
</div>

<div id="reset-npc-button">
    <form action="fight-assistant.php" method="post" class="form">
        <input type="hidden" name="action" value="resetNpc">
        <input type="hidden" name="TD" value="{$TD}">
        <input type="hidden" name="nextTD" value="">
        <input type="submit" value="Reset" />
    </form>
</div>

<div id="npc-panel">
    {foreach from=$NpcArray item=Npc}
        {if $Npc->vitality == 0 || $Npc->strength < 1}
            <div class="npc-dead">
        {elseif $TD != $Npc->nextTurn}
            <div class="npc-unactive">
        {else}
            <div class="npc-active">
        {/if}

            <div class="npc-name">
                <b>{$Npc->name}</b>
            </div>

            Vitalité : {$Npc->vitality}

            <div class="modify-character-element">
                <form action="fight-assistant.php" method="post" class="form">
                    <input type="number" style="width:40px;" name="modification" value="0">

                    <input type="hidden" name="action" value="update-character-element">
                    <input type="hidden" name="modified-character-element" value="vitality">
                    <input type="hidden" name="npcName" value="{$Npc->name}">
                    <input type="hidden" name="TD" value="{$TD}">
                    <input type="hidden" name="nextTD" value="">

                    <input type="submit" value="Modif." />
                </form>
            </div>

            <br />

            F. Vitesse : {$Npc->speedFactor}

            <div class="modify-character-element">
                <form action="fight-assistant.php" method="post" class="form">
                    <input type="number" style="width:34px;" name="modification" value="0">

                    <input type="hidden" name="action" value="update-character-element">
                    <input type="hidden" name="modified-character-element" value="speedFactor">
                    <input type="hidden" name="npcName" value="{$Npc->name}">
                    <input type="hidden" name="TD" value="{$TD}">
                    <input type="hidden" name="nextTD" value="">

                    <input type="submit" value="Modif." />
                </form>
            </div>

            <br />

            Proch. tour : {$Npc->nextTurn}

            <div class="modify-character-element">
                <form action="fight-assistant.php" method="post" class="form">
                    <input type="number" style="width:30px;" name="modification" value="0">

                    <input type="hidden" name="action" value="update-character-element">
                    <input type="hidden" name="modified-character-element" value="nextTurn">
                    <input type="hidden" name="npcName" value="{$Npc->name}">
                    <input type="hidden" name="TD" value="{$TD}">
                    <input type="hidden" name="nextTD" value="">

                    <input type="submit" value="Modif." />
                </form>
            </div>

            <br />

            Dégâts :

            <div class="modify-character-element">
                <form action="fight-assistant.php" method="post" class="form">
                    <input type="number" style="width:40px;" name="damage" value="0" min="0">

                    <input type="hidden" name="action" value="stamina-roll">
                    <input type="hidden" name="npcName" value="{$Npc->name}">
                    <input type="hidden" name="TD" value="{$TD}">
                    <input type="hidden" name="nextTD" value="">

                    <input type="submit" value="Endurance" />
                </form>
            </div>

            <br /><br />

            Force : {$Npc->strength} &nbsp; Esth. : {$Npc->aestheticism} &nbsp; Int. : {$Npc->intelligence}<br />
            Dext. : {$Npc->dexterity} &nbsp; Emp. : {$Npc->empathy} &nbsp; Char. : {$Npc->charisma}<br />
            Endu. : {$Npc->stamina}  &nbsp; Perc. : {$Npc->perception} &nbsp; R&eacute;f. : {$Npc->reflexes}<br />

            <br />

            {foreach from=$Npc->skills item=skill}
                {$skill['name']} : {$skill['points']}<br />
            {/foreach}

        </div>
    {/foreach}
</div>

<div id="npc-roll">
    {foreach from=$NpcArray item=Npc}
        {if $Npc->roll != '' && $Npc->roll != FALSE}
            <div class="npc-dice-result">
                <b>{$Npc->name}</b> | {$Npc->roll['attributName']}({$Npc->roll['attributPoints']})

                {if $Npc->roll['attributName'] != 'Endurance'}
                    + {$Npc->roll['skillName']}({$Npc->roll['skillPoints']})
                {/if}

                 | Diff.: {$Npc->roll['difficulty']} | <b>R : {$Npc->roll['nbrOfSuccess']}</b> <br />
            </div>
        {/if}
    {/foreach}
</div>
