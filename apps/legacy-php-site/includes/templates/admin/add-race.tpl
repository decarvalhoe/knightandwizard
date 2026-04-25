<h1>Ajouter une race</h1>

<form action="add-race.php" method="post" class="form">
    Nom : <input type="text" name="name"><br />

    <br />

    Catégorie : <input type="number" name="category" min="0"><br />

    <br />

    Vitalité : <input type="number" name="vitality" min="0"><br />

    <br />

    F. Vitesse : <input type="number" name="speedFactor" min="0"><br />

    F. Volonté : <input type="number" name="willFactor" min="0"><br />

    <br />

    <h3>Limites physiques</h3>

    Force : <input type="number" name="strengthMax" min="0"><br />

    Dextérité : <input type="number" name="dexterityMax" min="0"><br />

    Endurance : <input type="number" name="staminaMax" min="0"><br />

    <br />

    Charisme : <input type="number" name="charismaMax" min="0"><br />

    Esthétisme : <input type="number" name="aestheticismMax" min="0"><br />

    Empathie : <input type="number" name="empathyMax" min="0"><br />

    <br />

    Intelligence : <input type="number" name="intelligenceMax" min="0"><br />

    Perception : <input type="number" name="perceptionMax" min="0"><br />

    Reflexes : <input type="number" name="reflexesMax" min="0"><br />

    <h3>Atouts</h3>

    {foreach from=$assetsArray item=asset}
        {$asset['name']}

        <input type="checkbox" name="{$asset['id']}">

        {if $asset['unitId'] == 2}
            <input type="number" name="{$asset['id']}-points" min="0"> points
        {elseif $asset['unitId'] == 3}
            <input type="number" name="{$asset['id']}-points" min="0"> %
        {else}
            <input type="hidden" name="{$asset['id']}-points" value="0">
        {/if}

        <br />
    {/foreach}

    <br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
