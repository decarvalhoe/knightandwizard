<h1>{$City->name}</h1>

<h2>Lieux</h2>

{foreach from=$PlacesArray item=Place}
    <a href="play.php?place-id={$Place->id}">{$Place->name}</a>{if $Place->isCapital == 1} (Capitale){/if}

    <br />
{/foreach}
