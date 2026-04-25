<h1>Modifier une race</h1>

<form action="update-race.php?id={$raceArray['id']}" method="post" class="form">
    Nom : <input type="text" name="name" value="{$raceArray['name']}"><br />

    <br />

    Catégorie : <input type="number" name="category" value="{$raceArray['category']}" min="0"><br />

    <br />

    Vitalité : <input type="number" name="vitality" value="{$raceArray['vitality']}" min="0"><br />

    <br />

    F. Vitesse : <input type="number" name="speedFactor" value="{$raceArray['speedFactor']}" min="0"><br />

    F. Volonté : <input type="number" name="willFactor" value="{$raceArray['willFactor']}" min="0"><br />

    <br />

    <h3>Limites physiques</h3>

    Force : <input type="number" name="strengthMax" value="{$raceArray['strengthMax']}" min="0"><br />

    Dextérité : <input type="number" name="dexterityMax" value="{$raceArray['dexterityMax']}" min="0"><br />

    Endurance : <input type="number" name="staminaMax" value="{$raceArray['staminaMax']}" min="0"><br />

    Charisme : <input type="number" name="charismaMax" value="{$raceArray['charismaMax']}" min="0"><br />

    Esthétisme : <input type="number" name="aestheticismMax" value="{$raceArray['aestheticismMax']}" min="0"><br />

    Empathie : <input type="number" name="empathyMax" value="{$raceArray['empathyMax']}" min="0"><br />

    Intelligence : <input type="number" name="intelligenceMax" value="{$raceArray['intelligenceMax']}" min="0"><br />

    Perception : <input type="number" name="perceptionMax" value="{$raceArray['perceptionMax']}" min="0"><br />

    Reflexes : <input type="number" name="reflexesMax" value="{$raceArray['reflexesMax']}" min="0"><br />

    <h3>Atouts</h3>

    {foreach from=$assetsArray item=asset}
        {$asset['name']}

        <input type="checkbox" name="{$asset['id']}"
            {foreach $raceArray['assets'] item=raceAsset}
                {if $raceAsset['id'] == $asset['id']}checked{/if}
            {/foreach}
        >

        {if $asset['unitId'] == 2}
            <input type="number" name="{$asset['id']}-points" min="0"

            {foreach $raceArray['assets'] item=raceAsset}
                {if $raceAsset['id'] == $asset['id']}value="{$raceAsset['points']}"{/if}
            {/foreach}

             > points
        {elseif $asset['unitId'] == 3}
            <input type="number" name="{$asset['id']}-points" min="0"

            {foreach $raceArray['assets'] item=raceAsset}
                {if $raceAsset['id'] == $asset['id']}value="{$raceAsset['points']}"{/if}
            {/foreach}

            > %
        {else}
            <input type="hidden" name="{$asset['id']}-points" value="0">
        {/if}

        <br />
    {/foreach}

    <br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
