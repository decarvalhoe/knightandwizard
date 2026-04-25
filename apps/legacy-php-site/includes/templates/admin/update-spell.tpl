<h1>Modifier un sort</h1>

<form action="update-spell.php?id={$spellArray['id']}" method="post" class="form">
    Nom : <input type="text" name="name" value="{$spellArray['name']}">

    <br /><br />

    Effet : <textarea rows="4" cols="50" name="effect">{$spellArray['effect']}</textarea>

    <br /><br />

    Type :
    <select name="type-id">
        <option value="1" {if $spellArray['typeId'] == 1}selected{/if}>Abjuration</option>
        <option value="2" {if $spellArray['typeId'] == 2}selected{/if}>Altération</option>
        <option value="3" {if $spellArray['typeId'] == 3}selected{/if}>Blanche</option>
        <option value="4" {if $spellArray['typeId'] == 4}selected{/if}>Divinatoire</option>
        <option value="5" {if $spellArray['typeId'] == 5}selected{/if}>Elémentaire</option>
        <option value="6" {if $spellArray['typeId'] == 6}selected{/if}>Enchantement</option>
        <option value="7" {if $spellArray['typeId'] == 7}selected{/if}>Illusion</option>
        <option value="8" {if $spellArray['typeId'] == 8}selected{/if}>Invocation</option>
        <option value="9" {if $spellArray['typeId'] == 9}selected{/if}>Naturelle</option>
        <option value="10" {if $spellArray['typeId'] == 10}selected{/if}>Nécromancie</option>
        <option value="11" {if $spellArray['typeId'] == 11}selected{/if}>Noire</option>
    </select>

    <br /><br />

    Valeur : <input type="number" name="value" min="1" value="{$spellArray['value']}">

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
