<h1><a href="play.php?place-id={$Place->id}">{$Place->name}</a></h1>

<span class="play-sub-title">Personnages présents :</span>

<br />

<div class="characters-container">
    {foreach from=$PresentCharractersArray key=k item=Character}
        {include file='character-thumbnail.tpl'}
    {/foreach}
</div>

<div id="include-character">
    <form action="play.php?place-id={$placeId}&action=place-character" method="post" class="form">
        <select name="character-id">
            <option value="">Inclure un personnage</option>

            {foreach from=$MyCharactersArray key=k item=MyCharacter}
                {if $MyCharacter->place->id != $placeId}
                    <option value="{$MyCharacter->id}">{$MyCharacter->name}</option>
                {/if}
            {/foreach}
        </select>

            <input type="submit" value="Entrez" />
    </form>
</div>

<br />

{foreach from=$commentsArray key=i item=comment}
    {if $comment['text'] == '<kw>demarcation-line</kw>'}
        <div class="forum-post-demarcation-line">Fin de la scène</div>
    {else}
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

                <br />

                {$comment['date']|date_format:"%d.%m.%y"}
            </div>

            <div class="forum-post-content">
                {$comment['text']}
            </div>

            <div class="forum-post-options">
                {if $comment['myPost'] == TRUE}
                    <a href="play.php?action=remove-post&post-id={$comment['id']}&place-id={$placeId}" title="Supprimer">
                        <span class="glyphicon glyphicon-remove"></span>
                    </a>
                {/if}
            </div>
        </div>
    {/if}
{/foreach}

{if $iHavePresentCharacters == TRUE}
    <div id="forum-post-options">
        <form action="play.php?action=new-comment&place-id={$placeId}" method="post" class="form">
            <div id="play-select-character">
                <select name="character-id" id="play-character-selector" onchange="loadChar()">
                    {foreach from=$MyCharactersArray key=k item=MyCharacter}
                        {if $MyCharacter->place->id == $placeId}
                            <option value="{$MyCharacter->id}">{$MyCharacter->name}</option>
                        {/if}
                    {/foreach}
                </select>
            </div>

            <div id="play-action-comment-fields">
                <div id="play-comment-field">
                    <span class="play-sub-title">Texte</span>

                    <div id="play-comment-form">
                        <textarea rows="4" cols="70" name="comment"></textarea>
                    </div>
                </div>

                <div id="play-action-field">
                    <span class="play-sub-title">Action</span>

                    <div id="play-action-form">
                        <select name="action-attribute">
                            <option value="">Attributs</option>
                            <option id="attribute-strength" value="strength"></option>
                            <option id="attribute-dexterity" value="dexterity"></option>
                            <option id="attribute-stamina" value="stamina"></option>

                            <option id="attribute-aestheticism" value="aestheticism"></option>
                            <option id="attribute-charisma" value="charisma"></option>
                            <option id="attribute-empathy" value="empathy"></option>

                            <option id="attribute-intelligence" value="intelligence"></option>
                            <option id="attribute-perception" value="perception"></option>
                            <option id="attribute-reflexes" value="reflexes"></option>
                        </select>

                        <select name="action-skill" id="play-action-form-select-skill">
                            <option value="">Compétences</option>
                        </select>

                        <div id="play-action-form-specialisations-container">
                            <span class="play-sub-title">Spécialisations</span><br />
                            <span id="play-action-form-check-specialisations"></span>
                        </div>

                        <div id="play-action-form-difficulty">
                            Difficulté : <input type="number" name="difficulty" value="7" min="2">
                        </div>
                    </div>
                </div>
            </div>

            <div id="play-action-mj-fields">
                <span class="play-sub-title">Option de MJ</span>

                <div id="mj-options-selector">
                    <select name="mj-option-id">
                        <option value="">Aucune</option>
                        <option value="1">Faire une ligne de démarcation</option>
                    </select>
                </div>

                <br />

                <a href="" id="play-action-new-challenge-link">Créer un défi</a>
            </div>

            <div id="post-button">
                <input type="hidden" id="hidden-place-id" value="{$placeId}" />
                <input type="submit" value="Poster" />
            </div>
        </form>
    </div>

    {literal}
        <script>
            $(window).on("load", loadChar);

            function loadChar() {
                var xhttp = new XMLHttpRequest();
                var charId = $('#play-character-selector').val();

                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        JsonChar = JSON.parse(this.responseText);

                        if(JsonChar.status['id'] != 5){
                            $("#play-action-field").show();
                            $("#play-action-mj-fields").hide();

                            document.getElementById("attribute-strength").innerHTML = "Force : " + JsonChar.strength;
                            document.getElementById("attribute-dexterity").innerHTML = "Dextérité : " + JsonChar.dexterity;
                            document.getElementById("attribute-stamina").innerHTML = "Endurance : " + JsonChar.stamina;

                            document.getElementById("attribute-aestheticism").innerHTML = "Esthétisme : " + JsonChar.aestheticism;
                            document.getElementById("attribute-charisma").innerHTML = "Charisme : " + JsonChar.charisma;
                            document.getElementById("attribute-empathy").innerHTML = "Empathie : " + JsonChar.empathy;

                            document.getElementById("attribute-intelligence").innerHTML = "Intelligence : " + JsonChar.intelligence;
                            document.getElementById("attribute-perception").innerHTML = "Perception : " + JsonChar.perception;
                            document.getElementById("attribute-reflexes").innerHTML = "Réflexes : " + JsonChar.reflexes;

                            $("#play-action-form-select-skill").empty();
                            $("#play-action-form-select-skill").append("<option value=''>Compétences</option>");

                            $.each(JsonChar.skills, function(index, value) {
                                if(value['level'] == 0){
                                    $("#play-action-form-select-skill").append("<option value='" + value['id'] + "'>" + value['name'] + " : " + value['points'] + "</option>");
                                }
                            });

                            $("#play-action-form-check-specialisations").empty();

                            $.each(JsonChar.skills, function(index, value) {
                                if(value['level'] != 0){
                                    $("#play-action-form-check-specialisations").append("<input type='checkbox' name='specialisations[]' value='" + value['id'] + "'> " + value['name'] + " : " + value['points'] + "<br />");
                                }
                            });
                        }else{
                            $("#play-action-field").hide();
                            $("#play-action-mj-fields").show();

                            var placeId = $('#hidden-place-id').val();

                            $('#play-action-new-challenge-link').attr("href", "new-challenge.php?mj-id=" + JsonChar.id + "&place-id=" + placeId);
                        }
                    }
                };

                xhttp.open("GET", "play.php?action=get-json-character&charId=" + charId, true);
                xhttp.send();
            }
        </script>
    {/literal}
{/if}
