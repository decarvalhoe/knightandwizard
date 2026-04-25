<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 15:25:39
         compiled from "../includes/templates/admin/assets-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:8272124375b2a3955198e09-41636881%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'daa35ba9e091af4033e6c618354c1b80f46ad772' => 
    array (
      0 => '../includes/templates/admin/assets-list.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8272124375b2a3955198e09-41636881',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b2a39551ea679_92518980',
  'variables' => 
  array (
    'assetsArray' => 0,
    'asset' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b2a39551ea679_92518980')) {function content_5b2a39551ea679_92518980($_smarty_tpl) {?><h2>Liste d'atouts</h2>

<a href="levels-assets-list.php">Atouts de niveaux</a>

<br /><br />

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>Effet</td>
			<td>Valeur</td>
			<td>Activation</td>
		</tr>
	</thead>

	<?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['assetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
?>
		<tr>
			<td><?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['asset']->value['effect'];?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['asset']->value['value'];?>
</td>
            <td><?php echo $_smarty_tpl->tpl_vars['asset']->value['activation'];?>
</td>
			<td><a href="update-asset.php?id=<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
">Modifier</a></td>
		</tr>
	<?php } ?>
</table>
<?php }} ?>