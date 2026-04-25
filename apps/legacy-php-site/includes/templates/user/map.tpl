<h1>Choisissez votre destination</h1>

{foreach from=$forumPlacesArray key=i item=place}
    <a href="play.php?place-id={$place['id']}">
        <div class="map-place-name">
            {$place['name']}
        </div>
    </a>

    <br /><br />
{/foreach}
