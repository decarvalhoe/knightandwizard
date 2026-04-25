<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:17:49
         compiled from "../includes/templates/user/add-character-race.tpl" */ ?>
<?php /*%%SmartyHeaderCode:8976265345c6985d6664243-10610623%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'f5634eab0c6e951b2935d7de2558f054d88ea014' => 
    array (
      0 => '../includes/templates/user/add-character-race.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8976265345c6985d6664243-10610623',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6985d66b2510_15338927',
  'variables' => 
  array (
    'racesArray' => 0,
    'race' => 0,
    'k' => 0,
    'asset' => 0,
    'step' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6985d66b2510_15338927')) {function content_5c6985d66b2510_15338927($_smarty_tpl) {?><h2>Race</h2>

<form action="add-character.php" method="post" class="form">
    <div class="add-character-race-left-col">
        <select id="add-character-selectbox-race" name="raceId">
            <?php  $_smarty_tpl->tpl_vars['race'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['race']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['racesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['race']->key => $_smarty_tpl->tpl_vars['race']->value){
$_smarty_tpl->tpl_vars['race']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['race']->key;
?>
                <option value="<?php echo $_smarty_tpl->tpl_vars['race']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['race']->value['name'];?>
</option>
            <?php } ?>
        </select>
    </div>

    <div class="add-character-race-right-col">
        <?php  $_smarty_tpl->tpl_vars['race'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['race']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['racesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['race']->key => $_smarty_tpl->tpl_vars['race']->value){
$_smarty_tpl->tpl_vars['race']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['race']->key;
?>
            <?php if ($_smarty_tpl->tpl_vars['k']->value!=0){?>
                <div id="display-race-<?php echo $_smarty_tpl->tpl_vars['race']->value['id'];?>
" style="display:none;">
                    <h3>Atouts de race</h3>

                    <?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['race']->value['assets']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
?>
                        <?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>


                        <?php if ($_smarty_tpl->tpl_vars['asset']->value['unitId']==2){?>
    						: <?php echo $_smarty_tpl->tpl_vars['asset']->value['points'];?>

    					<?php }elseif($_smarty_tpl->tpl_vars['asset']->value['unitId']==3){?>
    						<?php echo $_smarty_tpl->tpl_vars['asset']->value['points'];?>
 %
    					<?php }?>

                        <br />
                    <?php } ?>
                </div>
            <?php }?>
        <?php } ?>
    </div>

    <br /><br />

    <input type="hidden" name="step" value="<?php echo $_smarty_tpl->tpl_vars['step']->value;?>
">
    <input type="submit" value="Suivant" />
</form>


    <script language=javascript>
        var race_id = 0;
        var selectbox = document.getElementById("add-character-selectbox-race");

        function display_race() {
            if(race_id != 0){
                document.getElementById("display-race-" + race_id).style.display = "none";
            }

            race_id = selectbox.options[selectbox.selectedIndex].value;
            var race_name = selectbox.options[selectbox.selectedIndex].text;

            if(race_name != 'Aléatoire'){
                document.getElementById("display-race-" + race_id).style.display = "block";
            }
        }

        window.onload = display_race;
        document.getElementById("add-character-selectbox-race").addEventListener('change', display_race);
    </script>

<?php }} ?>