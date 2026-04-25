<?php /* Smarty version Smarty-3.1.14, created on 2020-02-29 13:08:33
         compiled from "../includes/templates/admin/update-class-asset.tpl" */ ?>
<?php /*%%SmartyHeaderCode:20001465465b54dd2c9c6bf3-58458754%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '3e8f37cae7451004b64d141cc6ebe30ea3994151' => 
    array (
      0 => '../includes/templates/admin/update-class-asset.tpl',
      1 => 1538508576,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '20001465465b54dd2c9c6bf3-58458754',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b54dd2c9f76d8_98436339',
  'variables' => 
  array (
    'classArray' => 0,
    'orientationArray' => 0,
    'assetsArray' => 0,
    'asset' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b54dd2c9f76d8_98436339')) {function content_5b54dd2c9f76d8_98436339($_smarty_tpl) {?><h1>Ajouter un atout à une classe</h1>

Classe : <?php echo $_smarty_tpl->tpl_vars['classArray']->value['name'];?>
<br />
Orientation : <?php echo $_smarty_tpl->tpl_vars['orientationArray']->value['name'];?>


<form action="update-class-asset.php?id=<?php echo $_smarty_tpl->tpl_vars['classArray']->value['id'];?>
" method="post" class="form">
    Atout :
    <select name="asset-id">
        <?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['assetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>