<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 15:25:44
         compiled from "../includes/templates/admin/levels-assets-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:3985153635b5e14565d38e7-46550504%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '6bdcbd9c9c7a509f00b6a55ddc81b33ea86c091c' => 
    array (
      0 => '../includes/templates/admin/levels-assets-list.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '3985153635b5e14565d38e7-46550504',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b5e145661fc71_76278837',
  'variables' => 
  array (
    'k' => 0,
    'levelMax' => 0,
    'levelsAssetsArray' => 0,
    'levelAsset' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b5e145661fc71_76278837')) {function content_5b5e145661fc71_76278837($_smarty_tpl) {?><h1>Liste d'atouts de niveaux</h1>

<?php $_smarty_tpl->tpl_vars['k'] = new Smarty_variable(1, null, 0);?>

<?php while ($_smarty_tpl->tpl_vars['k']->value++<$_smarty_tpl->tpl_vars['levelMax']->value){?>
	<h2>Niveau <?php echo $_smarty_tpl->tpl_vars['k']->value;?>
</h2>

	<a href="add-level-asset.php?level=<?php echo $_smarty_tpl->tpl_vars['k']->value;?>
" class="update-link">Ajouter un atout</a>

	<br />

	<table>
		<thead>
			<tr>
				<td>Nom</td>
				<td>Orientation</td>
				<td>Classe</td>
				<td>Race</td>
				<td>Conditions spéciales</td>
				<td>Effet</td>
				<td></td>
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
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['orientation'];?>
</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['class'];?>
</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['race'];?>
</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['specialCondition'];?>
</td>
					<td><?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['effect'];?>
</td>
					<td><a href="update-level-asset.php?id=<?php echo $_smarty_tpl->tpl_vars['levelAsset']->value['assetMergeLevelId'];?>
">Modifier</a></td>
				</tr>
			<?php }?>
		<?php } ?>
	</table>
<?php }?>
<?php }} ?>