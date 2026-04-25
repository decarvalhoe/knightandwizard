<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 15:28:08
         compiled from "../includes/templates/user/play.tpl" */ ?>
<?php /*%%SmartyHeaderCode:3164162325c605a98f03be4-44463376%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '9b106632b8fde3c3e5b472cc7f3cbf94ede8cd80' => 
    array (
      0 => '../includes/templates/user/play.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '3164162325c605a98f03be4-44463376',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c605a99052e38_56407042',
  'variables' => 
  array (
    'Place' => 0,
    'PresentCharractersArray' => 0,
    'placeId' => 0,
    'MyCharactersArray' => 0,
    'MyCharacter' => 0,
    'commentsArray' => 0,
    'comment' => 0,
    'i' => 0,
    'iHavePresentCharacters' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c605a99052e38_56407042')) {function content_5c605a99052e38_56407042($_smarty_tpl) {?><?php if (!is_callable('smarty_modifier_date_format')) include '/home/fkb001/knightandwizard.ch/includes/smarty/plugins/modifier.date_format.php';
?><h1><a href="play.php?place-id=<?php echo $_smarty_tpl->tpl_vars['Place']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['Place']->value->name;?>
</a></h1>

<span class="play-sub-title">Personnages présents :</span>

<br />

<div class="characters-container">
    <?php  $_smarty_tpl->tpl_vars['Character'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Character']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['PresentCharractersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Character']->key => $_smarty_tpl->tpl_vars['Character']->value){
$_smarty_tpl->tpl_vars['Character']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['Character']->key;
?>
        <?php echo $_smarty_tpl->getSubTemplate ('character-thumbnail.tpl', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

    <?php } ?>
</div>

<div id="include-character">
    <form action="play.php?place-id=<?php echo $_smarty_tpl->tpl_vars['placeId']->value;?>
&action=place-character" method="post" class="form">
        <select name="character-id">
            <option value="">Inclure un personnage</option>

            <?php  $_smarty_tpl->tpl_vars['MyCharacter'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['MyCharacter']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['MyCharactersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['MyCharacter']->key => $_smarty_tpl->tpl_vars['MyCharacter']->value){
$_smarty_tpl->tpl_vars['MyCharacter']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['MyCharacter']->key;
?>
                <?php if ($_smarty_tpl->tpl_vars['MyCharacter']->value->place->id!=$_smarty_tpl->tpl_vars['placeId']->value){?>
                    <option value="<?php echo $_smarty_tpl->tpl_vars['MyCharacter']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['MyCharacter']->value->name;?>
</option>
                <?php }?>
            <?php } ?>
        </select>

            <input type="submit" value="Entrez" />
    </form>
</div>

<br />

<?php  $_smarty_tpl->tpl_vars['comment'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['comment']->_loop = false;
 $_smarty_tpl->tpl_vars['i'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['commentsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['comment']->key => $_smarty_tpl->tpl_vars['comment']->value){
$_smarty_tpl->tpl_vars['comment']->_loop = true;
 $_smarty_tpl->tpl_vars['i']->value = $_smarty_tpl->tpl_vars['comment']->key;
?>
    <?php if ($_smarty_tpl->tpl_vars['comment']->value['text']=='<kw>demarcation-line</kw>'){?>
        <div class="forum-post-demarcation-line">Fin de la scène</div>
    <?php }else{ ?>
        <?php if ((1 & $_smarty_tpl->tpl_vars['i']->value)){?>
            <div class="forum-post-odd">
        <?php }else{ ?>
            <div class="forum-post-even">
        <?php }?>
            <div class="forum-character-profile">
                <?php echo $_smarty_tpl->tpl_vars['comment']->value['Character']->name;?>
<br />

                <a href="character-detail.php?id=<?php echo $_smarty_tpl->tpl_vars['comment']->value['Character']->id;?>
">
                    <img src="<?php echo $_smarty_tpl->tpl_vars['comment']->value['Character']->profilImg;?>
" alt="<?php echo $_smarty_tpl->tpl_vars['comment']->value['Character']->name;?>
" height="100" width="80">
                </a>

                <br />

                <?php echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['comment']->value['date'],"%d.%m.%y");?>

            </div>

            <div class="forum-post-content">
                <?php echo $_smarty_tpl->tpl_vars['comment']->value['text'];?>

            </div>

            <div class="forum-post-options">
                <?php if ($_smarty_tpl->tpl_vars['comment']->value['myPost']==true){?>
                    <a href="play.php?action=remove-post&post-id=<?php echo $_smarty_tpl->tpl_vars['comment']->value['id'];?>
&place-id=<?php echo $_smarty_tpl->tpl_vars['placeId']->value;?>
" title="Supprimer">
                        <span class="glyphicon glyphicon-remove"></span>
                    </a>
                <?php }?>
            </div>
        </div>
    <?php }?>
<?php } ?>

<?php if ($_smarty_tpl->tpl_vars['iHavePresentCharacters']->value==true){?>
    <div id="forum-post-options">
        <form action="play.php?action=new-comment&place-id=<?php echo $_smarty_tpl->tpl_vars['placeId']->value;?>
" method="post" class="form">
            <div id="play-select-character">
                <select name="character-id" id="play-character-selector" onchange="loadChar()">
                    <?php  $_smarty_tpl->tpl_vars['MyCharacter'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['MyCharacter']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['MyCharactersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['MyCharacter']->key => $_smarty_tpl->tpl_vars['MyCharacter']->value){
$_smarty_tpl->tpl_vars['MyCharacter']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['MyCharacter']->key;
?>
                        <?php if ($_smarty_tpl->tpl_vars['MyCharacter']->value->place->id==$_smarty_tpl->tpl_vars['placeId']->value){?>
                            <option value="<?php echo $_smarty_tpl->tpl_vars['MyCharacter']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['MyCharacter']->value->name;?>
</option>
                        <?php }?>
                    <?php } ?>
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
                <input type="hidden" id="hidden-place-id" value="<?php echo $_smarty_tpl->tpl_vars['placeId']->value;?>
" />
                <input type="submit" value="Poster" />
            </div>
        </form>
    </div>

    
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
    
<?php }?>
<?php }} ?>