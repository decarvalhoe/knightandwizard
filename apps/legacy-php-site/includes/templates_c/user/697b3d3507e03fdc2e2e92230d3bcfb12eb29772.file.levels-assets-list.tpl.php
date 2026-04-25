<?php /* Smarty version Smarty-3.1.14, created on 2024-11-10 15:19:22
         compiled from "../includes/templates/user/levels-assets-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:20235565965c72e4a0a73df9-95567908%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '697b3d3507e03fdc2e2e92230d3bcfb12eb29772' => 
    array (
      0 => '../includes/templates/user/levels-assets-list.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '20235565965c72e4a0a73df9-95567908',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c72e4a0b0a9c2_51357296',
  'variables' => 
  array (
    'k' => 0,
    'levelMax' => 0,
    'levelsAssetsArray' => 0,
    'levelAsset' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c72e4a0b0a9c2_51357296')) {function content_5c72e4a0b0a9c2_51357296($_smarty_tpl) {?><h1>Atouts de niveaux</h1>

<?php $_smarty_tpl->tpl_vars['k'] = new Smarty_variable(1, null, 0);?>

<?php while ($_smarty_tpl->tpl_vars['k']->value++<$_smarty_tpl->tpl_vars['levelMax']->value){?>
	<h2>Niveau <?php echo $_smarty_tpl->tpl_vars['k']->value;?>
</h2>

	<table>
		<thead>
			<tr>
				<td>Nom</td>
				<td>Race</td>
				<td>Orientation</td>
				<td>Classe</td>
				<td>Conditions spéciales</td>
				<td>Effet</td>
			</tr>
		</thead>

		<?php  $_smarty_tpl->tpl_vars['levelAsset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['levelAsset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['levelsAssetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['levelAsset']->key => $_smarty_tpl->tpl_vars['levelAsset']->value){
$_smarty_tpl->tpl_vars['levelAsset']->_loop = true;
?>
			<?php if ($_smarty_tpl->tpl_vars['levelAsset']->value['level']==$_smarty_tpl->tpl_vars['k']->value){?>
				<tr>
					<td>
						<?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['name'];?>


						<?php if ($_smarty_tpl->tpl_vars['levelAsset']->value['unitId']==2||$_smarty_tpl->tpl_vars['levelAsset']->value['unitId']==3){?>
							: <?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['points'];?>
<?php if ($_smarty_tpl->tpl_vars['levelAsset']->value['unitId']==3){?>%<?php }?>
						<?php }?>
					</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['race'];?>
</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['orientation'];?>
</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['class'];?>
</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['specialCondition'];?>
</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['effect'];?>
</td>
				</tr>
			<?php }?>
		<?php } ?>
	</table>
<?php }?>
<?php }} ?>