<h1>Modification d'attribut du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">

    {if $attribute == 'strength'}
        Force
    {elseif $attribute == 'dexterity'}
        Dextérité
    {elseif $attribute == 'stamina'}
        Endurance
    {elseif $attribute == 'aestheticism'}
        Esthétisme
    {elseif $attribute == 'charisma'}
        Charisme
    {elseif $attribute == 'empathy'}
        Empathie
    {elseif $attribute == 'intelligence'}
        Intelligence
    {elseif $attribute == 'perception'}
        Perception
    {elseif $attribute == 'reflexes'}
        Reflexes
    {/if}

    : <input type="number" name="attribute-value" value="{$Character->$attribute}" min="0">

    <br /><br />

    <input type="hidden" name="attribute-name" value="{$attribute}">
    <input type="hidden" name="character-id" value="{$Character->id}">
    <input type="hidden" name="update" value="attribute">
    <input type="submit" value="Modifier" />
</form>
