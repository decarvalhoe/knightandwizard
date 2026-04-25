<h1>Règles</h1>

{foreach from=$contentArray item=content}
    {if $content['level'] != 'notice'}
        <h{$content['level'] + 1}>
            {$content['title']}
        </h{$content['level'] + 1}>
    {else}
        <span class="rules-notice">{$content['title']}</span>
    {/if}

    {if $content['content'] != FALSE}

        {if $content['level'] != 'notice'}
            <p class="p{$content['level'] + 1}">
                {$content['content']}
            </p>
        {else}
            <p class="p-notice">
                {$content['content']}
            </p>
        {/if}
    {/if}
{/foreach}
