<h1>Mes personnages</h1>

<a href="add-character.php"><button style="float:right;">Nouveau personnage</button></a>

<h3>PJ</h3>

<div class="characters-container">
    {foreach from=$CharactersPlayersArray item=Character}
        {if $Character->status['id'] == 1}
            {include file='character-thumbnail.tpl'}
        {/if}
    {/foreach}
</div>

<h3>PNJ actif</h3>

<div class="characters-container">
    {foreach from=$CharactersPlayersArray item=Character}
        {if $Character->status['id'] == 2}
            <div class="my-characters-list">
                {include file='character-thumbnail.tpl'}
            </div>
        {/if}
    {/foreach}
</div>

<h3>PNJ inactif</h3>

<div class="characters-container">
    {foreach from=$CharactersPlayersArray item=Character}
        {if $Character->status['id'] == 3}
            <div class="my-characters-list">
                {include file='character-thumbnail.tpl'}
            </div>
        {/if}
    {/foreach}
</div>

<h3>Mort</h3>

<div class="characters-container">
    {foreach from=$CharactersPlayersArray item=Character}
        {if $Character->status['id'] == 4}
            <div class="my-characters-list">
                {include file='character-thumbnail.tpl'}
            </div>
        {/if}
    {/foreach}
</div>

<h3>MJ</h3>

<div class="characters-container">
    {foreach from=$CharactersPlayersArray item=Character}
        {if $Character->status['id'] == 5}
            <div class="my-characters-list">
                {include file='character-thumbnail.tpl'}
            </div>
        {/if}
    {/foreach}
</div>
