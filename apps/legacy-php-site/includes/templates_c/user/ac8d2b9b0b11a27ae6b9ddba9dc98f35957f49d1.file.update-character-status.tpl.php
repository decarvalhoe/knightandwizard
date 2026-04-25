<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:49:12
         compiled from "../includes/templates/user/update-character-status.tpl" */ ?>
<?php /*%%SmartyHeaderCode:18616783775c62858727f344-69136899%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'ac8d2b9b0b11a27ae6b9ddba9dc98f35957f49d1' => 
    array (
      0 => '../includes/templates/user/update-character-status.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '18616783775c62858727f344-69136899',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6285872b5231_38774477',
  'variables' => 
  array (
    'statusArray' => 0,
    'status' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6285872b5231_38774477')) {function content_5c6285872b5231_38774477($_smarty_tpl) {?><h1>Modification du status du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Status :
    <select name="status-id">
        <?php  $_smarty_tpl->tpl_vars['status'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['status']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['statusArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['status']->key => $_smarty_tpl->tpl_vars['status']->value){
$_smarty_tpl->tpl_vars['status']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['status']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['status']->value['id'];?>
" <?php if ($_smarty_tpl->tpl_vars['status']->value['id']==$_smarty_tpl->tpl_vars['Character']->value->status['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['status']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="status">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>