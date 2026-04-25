<?php /* Smarty version Smarty-3.1.14, created on 2025-07-04 15:56:14
         compiled from "../includes/templates/admin/update-class.tpl" */ ?>
<?php /*%%SmartyHeaderCode:1673753505e6d03446bb277-18055796%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '19022411ec5ea6dc1b9212aa0a6fb1ad9c9aa484' => 
    array (
      0 => '../includes/templates/admin/update-class.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1673753505e6d03446bb277-18055796',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5e6d0344753c39_26105713',
  'variables' => 
  array (
    'classArray' => 0,
    'orientationsArray' => 0,
    'orientation' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5e6d0344753c39_26105713')) {function content_5e6d0344753c39_26105713($_smarty_tpl) {?><h1>Modifier une classe</h1>

<form action="update-class.php?id=<?php echo $_smarty_tpl->tpl_vars['classArray']->value['id'];?>
" method="post" class="form">
    Nom : <input type="text" name="name" value="<?php echo $_smarty_tpl->tpl_vars['classArray']->value['name'];?>
"><br />

    Orientation :
    <select name="orientation-id">
        <?php  $_smarty_tpl->tpl_vars['orientation'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['orientation']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['orientationsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['orientation']->key => $_smarty_tpl->tpl_vars['orientation']->value){
$_smarty_tpl->tpl_vars['orientation']->_loop = true;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['orientation']->value['id'];?>
" <?php if ($_smarty_tpl->tpl_vars['classArray']->value['orientationId']==$_smarty_tpl->tpl_vars['orientation']->value['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['orientation']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>