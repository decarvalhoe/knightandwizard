<h2>Liste des classes</h2>

{foreach from=$classesArray item=orientation}
    <h3>{$orientation['name']}</h3>

    {foreach from=$orientation['classes'] item=class}
        &nbsp;&nbsp;&nbsp;&nbsp; {$class['name']} <br />
    {/foreach}
{/foreach}
