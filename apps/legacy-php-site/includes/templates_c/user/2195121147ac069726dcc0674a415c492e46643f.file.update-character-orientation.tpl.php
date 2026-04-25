<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 10:07:06
         compiled from "../includes/templates/user/update-character-orientation.tpl" */ ?>
<?php /*%%SmartyHeaderCode:3347756355e5a578dc93d66-88556148%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '2195121147ac069726dcc0674a415c492e46643f' => 
    array (
      0 => '../includes/templates/user/update-character-orientation.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '3347756355e5a578dc93d66-88556148',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5e5a578dce54b6_91495139',
  'variables' => 
  array (
    'orientationsArray' => 0,
    'orientation' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5e5a578dce54b6_91495139')) {function content_5e5a578dce54b6_91495139($_smarty_tpl) {?><h1>Modification de l'orientation du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Orientation :
    <select name="orientationId">
        <?php  $_smarty_tpl->tpl_vars['orientation'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['orientation']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['orientationsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['orientation']->key => $_smarty_tpl->tpl_vars['orientation']->value){
$_smarty_tpl->tpl_vars['orientation']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['orientation']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['orientation']->value['id'];?>
" <?php if ($_smarty_tpl->tpl_vars['orientation']->value['id']==$_smarty_tpl->tpl_vars['Character']->value->orientation['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['orientation']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br />
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="orientation">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>