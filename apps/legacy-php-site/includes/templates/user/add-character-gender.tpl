<form action="add-character.php" method="post" class="form">
    <h2>Genre</h2>

    <select name="genderId">
        {foreach from=$gendersArray key=k item=gender}
            <option value="{$gender['id']}">{$gender['name']}</option>
        {/foreach}
    </select>

    <br /><br />
    
    <input type="hidden" name="step" value="{$step}">
    <input type="submit" value="Suivant" />
</form>
