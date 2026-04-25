<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 09:53:08
         compiled from "../includes/templates/user/classes-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:20575311155cc80a3a37f755-82110526%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'cf9d2c94d49e40c440661bb904c94619c39da058' => 
    array (
      0 => '../includes/templates/user/classes-list.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '20575311155cc80a3a37f755-82110526',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5cc80a3a407753_84730173',
  'variables' => 
  array (
    'classesArray' => 0,
    'orientation' => 0,
    'class' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5cc80a3a407753_84730173')) {function content_5cc80a3a407753_84730173($_smarty_tpl) {?><h2>Liste des classes</h2>

<?php  $_smarty_tpl->tpl_vars['orientation'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['orientation']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['classesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['orientation']->key => $_smarty_tpl->tpl_vars['orientation']->value){
$_smarty_tpl->tpl_vars['orientation']->_loop = true;
?>
    <h3><?php echo $_smarty_tpl->tpl_vars['orientation']->value['name'];?>
</h3>

    <?php  $_smarty_tpl->tpl_vars['class'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['class']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['orientation']->value['classes']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['class']->key => $_smarty_tpl->tpl_vars['class']->value){
$_smarty_tpl->tpl_vars['class']->_loop = true;
?>
        &nbsp;&nbsp;&nbsp;&nbsp; <?php echo $_smarty_tpl->tpl_vars['class']->value['name'];?>
 <br />
    <?php } ?>
<?php } ?>
<?php }} ?>