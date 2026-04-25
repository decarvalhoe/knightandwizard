<?php /* Smarty version Smarty-3.1.14, created on 2019-02-15 09:17:18
         compiled from "../includes/templates/user/forum-choose-place.tpl" */ ?>
<?php /*%%SmartyHeaderCode:3518324515c66758e3ec1e6-55514787%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '3cd32236f29b63ca7e4a1c83441bcbb560f160ca' => 
    array (
      0 => '../includes/templates/user/forum-choose-place.tpl',
      1 => 1538508562,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '3518324515c66758e3ec1e6-55514787',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'forumPlacesArray' => 0,
    'place' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c66758e41d103_11840623',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c66758e41d103_11840623')) {function content_5c66758e41d103_11840623($_smarty_tpl) {?><h1>Choisissez votre destination</h1>

<?php  $_smarty_tpl->tpl_vars['place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['place']->_loop = false;
 $_smarty_tpl->tpl_vars['i'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['forumPlacesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['place']->key => $_smarty_tpl->tpl_vars['place']->value){
$_smarty_tpl->tpl_vars['place']->_loop = true;
 $_smarty_tpl->tpl_vars['i']->value = $_smarty_tpl->tpl_vars['place']->key;
?>
    <a href="forum.php?place-id=<?php echo $_smarty_tpl->tpl_vars['place']->value['id'];?>
&page=1"><?php echo $_smarty_tpl->tpl_vars['place']->value['name'];?>
</a><br />
<?php } ?>
<?php }} ?>