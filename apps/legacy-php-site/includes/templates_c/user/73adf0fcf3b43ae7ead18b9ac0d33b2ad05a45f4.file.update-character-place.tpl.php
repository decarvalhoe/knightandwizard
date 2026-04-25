<?php /* Smarty version Smarty-3.1.14, created on 2025-03-22 20:06:33
         compiled from "../includes/templates/user/update-character-place.tpl" */ ?>
<?php /*%%SmartyHeaderCode:19625721335c69868eab1ca1-88320717%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '73adf0fcf3b43ae7ead18b9ac0d33b2ad05a45f4' => 
    array (
      0 => '../includes/templates/user/update-character-place.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '19625721335c69868eab1ca1-88320717',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c69868eb0c197_99570140',
  'variables' => 
  array (
    'Character' => 0,
    'PlacesArray' => 0,
    'Place' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c69868eb0c197_99570140')) {function content_5c69868eb0c197_99570140($_smarty_tpl) {?><h1>Déplacer le personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Emplacement :
    <select name="placeId">
        <option value="0" <?php if ($_smarty_tpl->tpl_vars['Character']->value->place->id==0){?>selected<?php }?>>Indisponible</option>

        <?php  $_smarty_tpl->tpl_vars['Place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Place']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['PlacesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Place']->key => $_smarty_tpl->tpl_vars['Place']->value){
$_smarty_tpl->tpl_vars['Place']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['Place']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['Place']->value->id;?>
" <?php if ($_smarty_tpl->tpl_vars['Place']->value->id==$_smarty_tpl->tpl_vars['Character']->value->place->id){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['Place']->value->name;?>
</option>
        <?php } ?>
    </select>

    <br />
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="place">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>