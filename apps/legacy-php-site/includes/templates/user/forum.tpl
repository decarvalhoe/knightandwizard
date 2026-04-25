{foreach from=$commentsArray key=i item=comment}
    {if $i is odd}
        <div class="forum-post-odd">
    {else}
        <div class="forum-post-even">
    {/if}
        <div class="forum-character-profile">
            {$comment['Character']->name}<br />

            <a href="character-detail.php?id={$comment['Character']->id}">
                <img src="{$comment['Character']->profilImg}" alt="{$comment['Character']->name}" height="100" width="80">
            </a>
        </div>

        <div class="forum-post-content">
            {$comment['text']}
        </div>

        <div class="forum-post-options">
            {if $comment['myPost'] == TRUE}
                <a href="forum.php?action=remove-post&post-id={$comment['id']}&place-id={$placeId}&page=1" title="Supprimer">
                    <span class="glyphicon glyphicon-remove"></span>
                </a>
            {/if}
        </div>
    </div>
{/foreach}

<form action="forum.php?place-id={$placeId}&page=1" method="post" class="form">
    <textarea rows="4" cols="50" name="comment"></textarea>

    <select name="characterId">
        {foreach from=$CharactersArray key=k item=Character}
            {if $Character->place['id'] == $placeId}
                <option value="{$Character->id}">{$Character->name}</option>
            {/if}
        {/foreach}
    </select>

    <input type="hidden" name="newComment" value="TRUE">
    <input type="submit" value="Poster" />
</form>
