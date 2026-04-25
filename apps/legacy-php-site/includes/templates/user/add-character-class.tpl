<form action="add-character.php" method="post" class="form">
    <h2>Classe</h2>

    <select name="classId">
        {foreach from=$classesArray key=k item=class}
            <option value="{$class['id']}">{$class['name']}</option>
        {/foreach}
    </select>

    <br /><br />
    
    <input type="hidden" name="step" value="{$step}">
    <input type="submit" value="Suivant" />
</form>
