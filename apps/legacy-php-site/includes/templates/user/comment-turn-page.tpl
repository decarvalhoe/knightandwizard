<div id="play-turn-page">
    Page :

    {while $i <= $nbrOfPages}
      <a href="play.php?place-id={$placeId}&page={$i}">
          {$i++}
      </a>
    {/while}
</div>
