<?php /* Smarty version Smarty-3.1.14, created on 2025-12-03 15:03:19
         compiled from "../includes/templates/admin/weapons-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:2751133105f3c16d1c05328-49128803%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '996d5368a464ddea0434cba5f00a79b97106409f' => 
    array (
      0 => '../includes/templates/admin/weapons-list.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '2751133105f3c16d1c05328-49128803',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5f3c16d1c599a3_28036570',
  'variables' => 
  array (
    'weaponsListArray' => 0,
    'Weapon' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5f3c16d1c599a3_28036570')) {function content_5f3c16d1c599a3_28036570($_smarty_tpl) {?><h1>Armes</h1>

<table>
	<thead>
		<tr>
			<td>Nom</td>
			<td>D&eacute;g&acirc;ts</td>
			<td>Type</td>
			<td>Diff.</td>
			<td>Poids</td>
			<td>Sp&eacute;cial</td>
		</tr>
	</thead>

	<?php  $_smarty_tpl->tpl_vars['Weapon'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Weapon']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['weaponsListArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Weapon']->key => $_smarty_tpl->tpl_vars['Weapon']->value){
$_smarty_tpl->tpl_vars['Weapon']->_loop = true;
?>
		<tr>
			<td><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->name;?>
</td>
			<td>
				<?php if ($_smarty_tpl->tpl_vars['Weapon']->value->useStrength==1){?>
					F+<?php echo $_smarty_tpl->tpl_vars['Weapon']->value->dammage;?>

				<?php }else{ ?>
					<?php echo $_smarty_tpl->tpl_vars['Weapon']->value->dammage;?>

				<?php }?>
			</td>
			<td><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->dammageType;?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->difficulty;?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->weight;?>
</td>
			<td><?php echo $_smarty_tpl->tpl_vars['Weapon']->value->special;?>
</td>
		</tr>
	<?php } ?>
</table>
<?php }} ?>