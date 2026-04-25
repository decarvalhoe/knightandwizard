<h1>{$Arena->name}</h1>

<p>
    {$Arena->description}

    <br />

    Arbitre : {$Arena->arbitrator->name}
</p>

<h2>Challengers</h2>

<h3>En attente de validation</h3>

<br />

<form action="fight.php?arena-id={$Arena->id}&action=add-challenger" method="post" class="form">
    Inclure un personnage :

    <select name="character-id">
        {foreach from=$MyCharacterArray key=k item=Character}
            <option value="{$Character->id}">{$Character->name}</option>
        {/foreach}
    </select>

    <input type="submit" value="Entrez" />
</form>
