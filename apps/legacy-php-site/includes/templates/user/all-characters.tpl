<h1>Tout les personnages</h1>

<div class="characters-container">
    {foreach from=$CharactersArray item=Character}
        {include file='character-thumbnail.tpl'}
    {/foreach}
</div>
