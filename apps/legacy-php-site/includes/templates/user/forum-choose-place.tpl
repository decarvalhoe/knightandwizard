<h1>Choisissez votre destination</h1>

{foreach from=$forumPlacesArray key=i item=place}
    <a href="forum.php?place-id={$place['id']}&page=1">{$place['name']}</a><br />
{/foreach}
