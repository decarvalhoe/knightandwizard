<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 10:07:19
         compiled from "../includes/templates/user/update-character-class.tpl" */ ?>
<?php /*%%SmartyHeaderCode:12612094855c66d197bebde2-56513446%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '7126f5d19cb62ded32c186e1fadb80133bc31e5d' => 
    array (
      0 => '../includes/templates/user/update-character-class.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '12612094855c66d197bebde2-56513446',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c66d197c25257_84132853',
  'variables' => 
  array (
    'classesArray' => 0,
    'class' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c66d197c25257_84132853')) {function content_5c66d197c25257_84132853($_smarty_tpl) {?><h1>Modification de l'orientation du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Classe :
    <select name="classId">
        <?php  $_smarty_tpl->tpl_vars['class'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['class']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['classesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['class']->key => $_smarty_tpl->tpl_vars['class']->value){
$_smarty_tpl->tpl_vars['class']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['class']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['class']->value['id'];?>
" <?php if ($_smarty_tpl->tpl_vars['class']->value['id']==$_smarty_tpl->tpl_vars['Character']->value->class['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['class']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br />
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="class">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>