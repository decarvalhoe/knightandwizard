<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:38:01
         compiled from "../includes/templates/user/characters.tpl" */ ?>
<?php /*%%SmartyHeaderCode:12875062615c6012b73036f9-17408774%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'dcfaadec25f4437d1c4e1919a709d02178428091' => 
    array (
      0 => '../includes/templates/user/characters.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '12875062615c6012b73036f9-17408774',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6012b73d2518_10141355',
  'variables' => 
  array (
    'CharactersPlayersArray' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6012b73d2518_10141355')) {function content_5c6012b73d2518_10141355($_smarty_tpl) {?><h1>Mes personnages</h1>

<a href="add-character.php"><button style="float:right;">Nouveau personnage</button></a>

<h3>PJ</h3>

<div class="characters-container">
    <?php  $_smarty_tpl->tpl_vars['Character'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Character']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['CharactersPlayersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Character']->key => $_smarty_tpl->tpl_vars['Character']->value){
$_smarty_tpl->tpl_vars['Character']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Character']->value->status['id']==1){?>
            <?php echo $_smarty_tpl->getSubTemplate ('character-thumbnail.tpl', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

        <?php }?>
    <?php } ?>
</div>

<h3>PNJ actif</h3>

<div class="characters-container">
    <?php  $_smarty_tpl->tpl_vars['Character'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Character']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['CharactersPlayersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Character']->key => $_smarty_tpl->tpl_vars['Character']->value){
$_smarty_tpl->tpl_vars['Character']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Character']->value->status['id']==2){?>
            <div class="my-characters-list">
                <?php echo $_smarty_tpl->getSubTemplate ('character-thumbnail.tpl', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

            </div>
        <?php }?>
    <?php } ?>
</div>

<h3>PNJ inactif</h3>

<div class="characters-container">
    <?php  $_smarty_tpl->tpl_vars['Character'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Character']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['CharactersPlayersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Character']->key => $_smarty_tpl->tpl_vars['Character']->value){
$_smarty_tpl->tpl_vars['Character']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Character']->value->status['id']==3){?>
            <div class="my-characters-list">
                <?php echo $_smarty_tpl->getSubTemplate ('character-thumbnail.tpl', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

            </div>
        <?php }?>
    <?php } ?>
</div>

<h3>Mort</h3>

<div class="characters-container">
    <?php  $_smarty_tpl->tpl_vars['Character'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Character']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['CharactersPlayersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Character']->key => $_smarty_tpl->tpl_vars['Character']->value){
$_smarty_tpl->tpl_vars['Character']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Character']->value->status['id']==4){?>
            <div class="my-characters-list">
                <?php echo $_smarty_tpl->getSubTemplate ('character-thumbnail.tpl', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

            </div>
        <?php }?>
    <?php } ?>
</div>

<h3>MJ</h3>

<div class="characters-container">
    <?php  $_smarty_tpl->tpl_vars['Character'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Character']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['CharactersPlayersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Character']->key => $_smarty_tpl->tpl_vars['Character']->value){
$_smarty_tpl->tpl_vars['Character']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Character']->value->status['id']==5){?>
            <div class="my-characters-list">
                <?php echo $_smarty_tpl->getSubTemplate ('character-thumbnail.tpl', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

            </div>
        <?php }?>
    <?php } ?>
</div>
<?php }} ?>