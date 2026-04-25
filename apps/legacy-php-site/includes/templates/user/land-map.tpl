<h1>{$Land->name}</h1>

<div class="two-col-left">
    <h2>Villes</h2>

    {foreach from=$CitiesAndTownsArray item=Place}
        {if $Place->status['id'] == 2}
            <a href="city-map.php?id={$Place->id}">{$Place->name}</a>{if $Place->isCapital == 1} (Capitale){/if}

            <br />
        {/if}
    {/foreach}

    <h2>Montagnes</h2>

    {foreach from=$CitiesAndTownsArray item=Place}
        {if $Place->status['id'] == 5}
            <a href="city-map.php?id={$Place->id}">{$Place->name}</a>{if $Place->isCapital == 1} (Capitale){/if}

            <br />
        {/if}
    {/foreach}
</div>

<div class="two-col-right">
    <div class="flag">
        <img class="painting" src="{$imgFlagPath}/{$Land->id}.jpg" alt="{$Land->name}" width="200" height="250">
    </div>
</div>
