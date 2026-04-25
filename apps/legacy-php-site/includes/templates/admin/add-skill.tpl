<h1>Ajouter une compétence</h1>

<form action="add-skill.php" method="post" class="form">
    Famille :
    <select name="skillFamilyId">
        {foreach from=$skillsFamiliesArray key=k item=skillsFamily}
            <option value="{$skillsFamily['id']}">{$skillsFamily['name']}</option>
        {/foreach}
    </select>

    <br />

    Spécialisation de :
    <select name="childOfId">
        <option value="">Aucune</option>

        {foreach from=$skillsArray key=k item=skill}
            <option value="{$skill['id']}">{$skill['name']}</option>
        {/foreach}
    </select>

    <br />

    Nom : <input type="text" name="name">

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
