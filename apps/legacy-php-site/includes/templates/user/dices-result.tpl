<div id="roll-info">
    <strong>{$diceType}</strong><br />
    Nombre de d&eacute;s :

    {if $diceType == 'd10'}
        {$numberOfD10}
    {elseif $diceType == 'd20'}
        {$numberOfD20}
    {/if}

    <br />

    Difficult&eacute; :

    {if $diceType == 'd10'}
        {$difficultyD10}
    {elseif $diceType == 'd20'}
        {$difficultyD20}
    {/if}

    <br />

    Nombre de r&eacute;ussites : {$dicesArray[0]['nbrOfSuccess']}
</div>

<br />

<div id="dices-result">
    {foreach from=$dicesArray key=1 item=dice}
        {if $dice['success'] == NO}
            <div class="dice">
        {elseif $dice['success'] == YES}
            <div class="dice-success">
        {elseif $dice['success'] == CRITICAL}
            <div class="dice-critical">
        {elseif $dice['success'] == FAIL}
            <div class="dice-fail">
        {elseif $dice['success'] == LAST_DICE}
            <div class="last-dice">
        {/if}
            {$dice['value']}
        </div>
    {/foreach}
</div>
