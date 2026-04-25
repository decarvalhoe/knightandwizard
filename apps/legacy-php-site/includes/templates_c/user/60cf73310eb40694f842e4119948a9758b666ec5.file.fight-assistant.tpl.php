<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 23:07:00
         compiled from "../includes/templates/user/fight-assistant.tpl" */ ?>
<?php /*%%SmartyHeaderCode:16883865635c686859056769-05621786%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '60cf73310eb40694f842e4119948a9758b666ec5' => 
    array (
      0 => '../includes/templates/user/fight-assistant.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '16883865635c686859056769-05621786',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c686859108b83_02676196',
  'variables' => 
  array (
    'TD' => 0,
    'NpcAvailableArray' => 0,
    'npc' => 0,
    'NpcArray' => 0,
    'Npc' => 0,
    'skill' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c686859108b83_02676196')) {function content_5c686859108b83_02676196($_smarty_tpl) {?><h1>Assistant de combat</h1>

<div id="TD-counter">
    <h2>DT</h2>

    <div id="TD-container">
        <?php echo $_smarty_tpl->tpl_vars['TD']->value;?>

    </div>

    <div id="TD-buttons">
        <div class="left-button">
            <form action="fight-assistant.php" method="post" class="form">
                <input type="hidden" name="TD" value="<?php echo $_smarty_tpl->tpl_vars['TD']->value;?>
">
                <input type="hidden" name="nextTD" value="-">
                <input type="submit" value="Pr&eacute;c&eacute;dent" />
            </form>
        </div>

        <div>
            <form action="fight-assistant.php" method="post" class="form">
                <input type="hidden" name="TD" value="<?php echo $_smarty_tpl->tpl_vars['TD']->value;?>
">
                <input type="hidden" name="nextTD" value="+">
                <input type="submit" value="Suivant" />
            </form>
        </div>
    </div>
</div>

<h2>PNJ</h2>

<div id="add-npc-form">
    <form action="fight-assistant.php" method="post" class="form">
        PNJ commun :
        <select name="NpcId">
            <?php  $_smarty_tpl->tpl_vars['npc'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['npc']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['NpcAvailableArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['npc']->key => $_smarty_tpl->tpl_vars['npc']->value){
$_smarty_tpl->tpl_vars['npc']->_loop = true;
?>
                <option value="<?php echo $_smarty_tpl->tpl_vars['npc']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['npc']->value['name'];?>
</option>
            <?php } ?>
        </select>

        <input type="number" name="nbrOfNewNpc" value="0" max="100">

        <input type="hidden" name="action" value="addNpc">
        <input type="hidden" name="TD" value="<?php echo $_smarty_tpl->tpl_vars['TD']->value;?>
">
        <input type="hidden" name="nextTD" value="">
        <input type="submit" value="Ajouter" />
    </form>
</div>

<div id="reset-npc-button">
    <form action="fight-assistant.php" method="post" class="form">
        <input type="hidden" name="action" value="resetNpc">
        <input type="hidden" name="TD" value="<?php echo $_smarty_tpl->tpl_vars['TD']->value;?>
">
        <input type="hidden" name="nextTD" value="">
        <input type="submit" value="Reset" />
    </form>
</div>

<div id="npc-panel">
    <?php  $_smarty_tpl->tpl_vars['Npc'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Npc']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['NpcArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Npc']->key => $_smarty_tpl->tpl_vars['Npc']->value){
$_smarty_tpl->tpl_vars['Npc']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Npc']->value->vitality==0||$_smarty_tpl->tpl_vars['Npc']->value->strength<1){?>
            <div class="npc-dead">
        <?php }elseif($_smarty_tpl->tpl_vars['TD']->value!=$_smarty_tpl->tpl_vars['Npc']->value->nextTurn){?>
            <div class="npc-unactive">
        <?php }else{ ?>
            <div class="npc-active">
        <?php }?>

            <div class="npc-name">
                <b><?php echo $_smarty_tpl->tpl_vars['Npc']->value->name;?>
</b>
            </div>

            Vitalité : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->vitality;?>


            <div class="modify-character-element">
                <form action="fight-assistant.php" method="post" class="form">
                    <input type="number" style="width:40px;" name="modification" value="0">

                    <input type="hidden" name="action" value="update-character-element">
                    <input type="hidden" name="modified-character-element" value="vitality">
                    <input type="hidden" name="npcName" value="<?php echo $_smarty_tpl->tpl_vars['Npc']->value->name;?>
">
                    <input type="hidden" name="TD" value="<?php echo $_smarty_tpl->tpl_vars['TD']->value;?>
">
                    <input type="hidden" name="nextTD" value="">

                    <input type="submit" value="Modif." />
                </form>
            </div>

            <br />

            F. Vitesse : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->speedFactor;?>


            <div class="modify-character-element">
                <form action="fight-assistant.php" method="post" class="form">
                    <input type="number" style="width:34px;" name="modification" value="0">

                    <input type="hidden" name="action" value="update-character-element">
                    <input type="hidden" name="modified-character-element" value="speedFactor">
                    <input type="hidden" name="npcName" value="<?php echo $_smarty_tpl->tpl_vars['Npc']->value->name;?>
">
                    <input type="hidden" name="TD" value="<?php echo $_smarty_tpl->tpl_vars['TD']->value;?>
">
                    <input type="hidden" name="nextTD" value="">

                    <input type="submit" value="Modif." />
                </form>
            </div>

            <br />

            Proch. tour : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->nextTurn;?>


            <div class="modify-character-element">
                <form action="fight-assistant.php" method="post" class="form">
                    <input type="number" style="width:30px;" name="modification" value="0">

                    <input type="hidden" name="action" value="update-character-element">
                    <input type="hidden" name="modified-character-element" value="nextTurn">
                    <input type="hidden" name="npcName" value="<?php echo $_smarty_tpl->tpl_vars['Npc']->value->name;?>
">
                    <input type="hidden" name="TD" value="<?php echo $_smarty_tpl->tpl_vars['TD']->value;?>
">
                    <input type="hidden" name="nextTD" value="">

                    <input type="submit" value="Modif." />
                </form>
            </div>

            <br />

            Dégâts :

            <div class="modify-character-element">
                <form action="fight-assistant.php" method="post" class="form">
                    <input type="number" style="width:40px;" name="damage" value="0" min="0">

                    <input type="hidden" name="action" value="stamina-roll">
                    <input type="hidden" name="npcName" value="<?php echo $_smarty_tpl->tpl_vars['Npc']->value->name;?>
">
                    <input type="hidden" name="TD" value="<?php echo $_smarty_tpl->tpl_vars['TD']->value;?>
">
                    <input type="hidden" name="nextTD" value="">

                    <input type="submit" value="Endurance" />
                </form>
            </div>

            <br /><br />

            Force : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->strength;?>
 &nbsp; Esth. : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->aestheticism;?>
 &nbsp; Int. : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->intelligence;?>
<br />
            Dext. : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->dexterity;?>
 &nbsp; Emp. : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->empathy;?>
 &nbsp; Char. : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->charisma;?>
<br />
            Endu. : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->stamina;?>
  &nbsp; Perc. : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->perception;?>
 &nbsp; R&eacute;f. : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->reflexes;?>
<br />

            <br />

            <?php  $_smarty_tpl->tpl_vars['skill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skill']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['Npc']->value->skills; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skill']->key => $_smarty_tpl->tpl_vars['skill']->value){
$_smarty_tpl->tpl_vars['skill']->_loop = true;
?>
                <?php echo $_smarty_tpl->tpl_vars['skill']->value['name'];?>
 : <?php echo $_smarty_tpl->tpl_vars['skill']->value['points'];?>
<br />
            <?php } ?>

        </div>
    <?php } ?>
</div>

<div id="npc-roll">
    <?php  $_smarty_tpl->tpl_vars['Npc'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Npc']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['NpcArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Npc']->key => $_smarty_tpl->tpl_vars['Npc']->value){
$_smarty_tpl->tpl_vars['Npc']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Npc']->value->roll!=''&&$_smarty_tpl->tpl_vars['Npc']->value->roll!=false){?>
            <div class="npc-dice-result">
                <b><?php echo $_smarty_tpl->tpl_vars['Npc']->value->name;?>
</b> | <?php echo $_smarty_tpl->tpl_vars['Npc']->value->roll['attributName'];?>
(<?php echo $_smarty_tpl->tpl_vars['Npc']->value->roll['attributPoints'];?>
)

                <?php if ($_smarty_tpl->tpl_vars['Npc']->value->roll['attributName']!='Endurance'){?>
                    + <?php echo $_smarty_tpl->tpl_vars['Npc']->value->roll['skillName'];?>
(<?php echo $_smarty_tpl->tpl_vars['Npc']->value->roll['skillPoints'];?>
)
                <?php }?>

                 | Diff.: <?php echo $_smarty_tpl->tpl_vars['Npc']->value->roll['difficulty'];?>
 | <b>R : <?php echo $_smarty_tpl->tpl_vars['Npc']->value->roll['nbrOfSuccess'];?>
</b> <br />
            </div>
        <?php }?>
    <?php } ?>
</div>
<?php }} ?>