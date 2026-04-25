<h1>{$Character->name}</h1>

<div id="character-detail-profil-img">
    <img class="painting" src="{$Character->profilImg}" alt="{$Character->name}" width="220" height="275"><br />

    {if $flag_CharacterIsMine == 'TRUE'}
        <a href="update-character.php?id={$Character->id}&update=profil-img" class="update-link">modifier</a>
    {/if}
</div>

{if $flag_CharacterIsMine == 'TRUE'}
    <form action="character-detail.php?id={$Character->id}" method="post" class="form" target="_blank">
        <input type="hidden" name="action" value="print-character">
        <input type="submit" style="float:right" value="Imprimer" />
    </form>

    <br />

    <div>
        Status : {$Character->status['name']}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=status" class="update-link"><span class="glyphicon glyphicon-pencil"></span></a>

        <br />

        Lieux :

        {if $Character->place->id == 0}
            Indisponible
        {else}
            <a href="play.php?place-id={$Character->place->id}">
                {$Character->place->name}
            </a>
        {/if}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=place" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
    </div>

    <h2>Informations</h2>

    <div class="character-detail-2-col-left">
        Nom : {$Character->name}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=name" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Sexe : {$Character->gender['name']}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=gender" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Race : {$Character->race['name']}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=race" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Orientation : {$Character->orientation['name']}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=orientation" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Classe : {$Character->class['name']}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=class" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Niveau : {$Character->level}
    </div>

    <div class="character-detail-info-column-right">
        Vitalité : {$Character->vitalityMax}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=vitality-max" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        F. Vitesse : {$Character->speedFactor}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=speed-factor" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        F. Volonté : {$Character->willFactor}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=will-factor" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Energie : {$Character->energyMax}

        &nbsp;

        <a href="update-character.php?id={$Character->id}&update=energy-max" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

        <br />

        Points : {$Character->levelPoints} / {$Character->levelUpAt}
    </div>

    <br />

    <div id="character-detail-attributes">
        <h2>Attributs</h2>

        <div class="character-detail-3-col-left">
            Force : {$Character->strength}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=strength" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Dextérité : {$Character->dexterity}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=dexterity" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Endurance : {$Character->stamina}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=stamina" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
        </div>

        <div class="character-detail-3-col-center">
            Esthétisme : {$Character->aestheticism}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=aestheticism" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Charisme : {$Character->charisma}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=charisma" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Empathie : {$Character->empathy}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=empathy" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
        </div>

        <div class="character-detail-3-col-right">
            Intelligence : {$Character->intelligence}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=intelligence" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Perception : {$Character->perception}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=perception" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
            <br />

            Réflexes : {$Character->reflexes}
            &nbsp;
            <a href="update-character.php?id={$Character->id}&update=attribute&attribute=reflexes" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
        </div>
    </div>

    <div id="character-detail-skills">
        <h2>Compétences</h2>

        <a href="update-character.php?id={$Character->id}&update=new-skill" style="float:right"><button>Nouvelle compétence</button></a>

        <br />

        {$leftCol = TRUE}

        {foreach from=$Character->skills key=k item=skill}
            {if ($k < $numberOfSkillsOnLeftColumn || $skill['isChildOf'] != 0) && $leftCol == TRUE}
                <div class="character-detail-2-col-left">
            {else}
                <div class="character-detail-2-col-right">

                {$leftCol = FALSE}
            {/if}

            {if $skill['isChildOf'] != 0}
                {$i = 0}

                {while $i++ < $skill['level']}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                {/while}
            {/if}

                {if $skill['isMain'] == 1}<b>{/if}

                {$skill['name']} : {$skill['points']}

                {if $skill['isMain'] == 1}</b>{/if}

                &nbsp;

                <a href="update-character.php?id={$Character->id}&update=skill&skill-id={$skill['id']}" class="update-link"><span class="glyphicon glyphicon-pencil"></a>

                &nbsp;

                <a href="update-character.php?id={$Character->id}&update=remove-skill&skill-id={$skill['id']}" title="Supprimer">
                    <span class="glyphicon glyphicon-remove"></span>
                </a>

                <br />
            </div>
        {/foreach}
    </div>

    <div id="character-detail-assets">
        <h2>Atouts</h2>

        <a href="update-character.php?id={$Character->id}&update=new-asset" style="float:right;"><button>Nouvel atout</button></a>

        <br /><br />

        {if $Character->level != 'NA'}
            <a href="update-character.php?id={$Character->id}&update=new-level-asset" style="float:right;"><button>Nouvel atout de niveau</button></a>

            <br />
        {/if}

        {foreach from=$Character->assets key=k item=asset}
            {if $k < 2}<div class="character-detail-asset-left">{else}<div class="character-detail-asset-right">{/if}
                {$asset['name']}

                {if $asset['points'] != 0}
                    : {$asset['points']}

                    {if $asset['unitId'] == 3}
                        %
                    {/if}
                {/if}

                {if $k == 0 && $Character->orientation['id'] != 1}
                    &nbsp;

                    <a href="update-character.php?id={$Character->id}&update=asset&asset-id={$asset['id']}" class="update-link"><span class="glyphicon glyphicon-pencil"></a>
                {/if}

                &nbsp;

                <a href="update-character.php?id={$Character->id}&update=remove-asset&asset-id={$asset['id']}" title="Supprimer">
                    <span class="glyphicon glyphicon-remove"></span>
                </a>
            </div>
        {/foreach}
    </div>

    {if {$Character->orientation['id']} == 1}
        <div id="character-detail-spells">
            <h2>Magie</h2>

            <a href="update-character.php?id={$Character->id}&update=new-spell">Ajouter</a>

            <table class="spells-table">
                <thead>
                    <tr>
                        <th>Sort</th>
                        <th>Type</th>
                        <th>Energie</th>
                        <th>TI</th>
                        <th>Diff.</th>
                        <th>Effet</th>
                    </tr>
                </thead>

                {foreach from=$Character->spells key=k item=spell}
                    <tr>
                        <td>{$spell['name']} : {$spell['points']}</td>
                        <td>
                            {if $spell['typeId'] == 1}
            					Abjuration
            				{elseif $spell['typeId'] == 2}
            					Altération
            				{elseif $spell['typeId'] == 3}
            					Blanche
            				{elseif $spell['typeId'] == 4}
            					Divinatoire
            				{elseif $spell['typeId'] == 5}
            					Elémentaire
            				{elseif $spell['typeId'] == 6}
            					Enchantement
            				{elseif $spell['typeId'] == 7}
            					Illusion
            				{elseif $spell['typeId'] == 8}
            					Invocation
            				{elseif $spell['typeId'] == 9}
            					Naturelle
            				{elseif $spell['typeId'] == 10}
            					Nécromancie
            				{elseif $spell['typeId'] == 11}
            					Noire
            				{/if}
                        </td>
                        <td>{$spell['energy']}</td>
                        <td>{$spell['castingTime']}</td>
                        <td>{$spell['difficulty']}</td>
                        <td>{$spell['effect']}</td>
                        <td>
                            <a href="update-character.php?id={$Character->id}&update=spell&spell-id={$spell['id']}" class="update-link">modifier</a>
                        </td>
                    </tr>
                {/foreach}
            </table>
        </div>
    {/if}

    <h2>Notes</h2>

    <form action="update-character.php?id={$Character->id}&update=note" method="post" class="form">
        <textarea name="note" rows="6" cols="143">{$Character->note}</textarea>

        <br />

        <input type="submit" style="float:right" value="Noter" />
    </form>

    <br />

    <div class="delete-container">
        <a href="javascript:AlertIt();" class="delete-link">Supprimer ce personnage</a>
    </div>


    <script type="text/javascript">
        function AlertIt() {
            var answer = confirm ("Voulez-vous vraiment supprimer ce personnage ?")

            if (answer)
            window.location="update-character.php?id={$Character->id}&update=remove";
        }
    </script>
{else}
    <h2>Informations</h2>

    <div class="character-detail-2-col-left">
        Lieux :

        {if $Character->place->id == 0}
            Indisponible
        {else}
            <a href="play.php?place-id={$Character->place->id}">
                {$Character->place->name}
            </a>

            <br />

            Esthétisme : {$Character->aestheticism}
        {/if}
    </div>

    <div class="character-detail-2-col-right">
        Joueur : {$CharacterOwner->name}
    </div>
{/if}
